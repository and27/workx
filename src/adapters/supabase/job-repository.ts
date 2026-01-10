import { randomUUID } from "crypto";
import { supabase } from "@/src/adapters/supabase/client";
import { job } from "@/src/domain/entities/job";
import {
  jobRepository,
  jobUpsertRecord,
  listJobsQuery,
} from "@/src/ports/job-repository";

type jobRow = {
  id: string;
  company: string;
  role: string;
  source: string;
  source_url: string | null;
  external_id: string | null;
  location: string;
  seniority: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const toJob = (row: jobRow): job => ({
  id: row.id,
  company: row.company,
  role: row.role,
  source: row.source,
  sourceUrl: row.source_url ?? null,
  externalId: row.external_id ?? null,
  location: row.location,
  seniority: row.seniority,
  tags: row.tags ?? [],
  publishedAt: row.published_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toUpsertRow = (record: jobUpsertRecord, now: string) => ({
  company: record.company,
  role: record.role,
  source: record.source,
  external_id: record.externalId,
  source_url: record.sourceUrl,
  location: record.location,
  seniority: record.seniority,
  tags: record.tags,
  published_at: record.publishedAt,
  updated_at: now,
});

export const createSupabaseJobRepository = (): jobRepository => ({
  async list(query: listJobsQuery) {
    let builder = supabase
      .from("jobs")
      .select("*")
      .order("updated_at", { ascending: false });
    const search = query.search?.trim();
    if (search) {
      builder = builder.or(`company.ilike.%${search}%,role.ilike.%${search}%`);
    }
    if (query.seniority) {
      builder = builder.eq("seniority", query.seniority);
    }
    if (query.source) {
      builder = builder.eq("source", query.source);
    }
    const tags = query.tags?.filter(Boolean) ?? [];
    if (tags.length > 0) {
      builder = builder.contains("tags", tags);
    }

    const { data, error } = await builder;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => toJob(row as jobRow));
  },
  async getById(query: { id: string }) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", query.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return data ? toJob(data as jobRow) : null;
  },
  async upsertByExternalId(input: { jobs: jobUpsertRecord[]; now: string }) {
    if (input.jobs.length === 0) {
      return { created: 0, updated: 0 };
    }

    const jobsBySource = input.jobs.reduce(
      (acc, record) => {
        if (!acc[record.source]) {
          acc[record.source] = [];
        }
        acc[record.source].push(record);
        return acc;
      },
      {} as Record<string, jobUpsertRecord[]>
    );

    const existingPairs = new Set<string>();

    for (const [source, records] of Object.entries(jobsBySource)) {
      const externalIds = records.map((record) => record.externalId);
      const { data, error } = await supabase
        .from("jobs")
        .select("external_id")
        .eq("source", source)
        .in("external_id", externalIds);

      if (error) {
        throw new Error(error.message);
      }

      for (const row of data ?? []) {
        if (row.external_id) {
          existingPairs.add(`${source}:${row.external_id}`);
        }
      }
    }

    const toInsert = input.jobs.filter(
      (record) => !existingPairs.has(`${record.source}:${record.externalId}`)
    );
    const toUpdate = input.jobs.filter((record) =>
      existingPairs.has(`${record.source}:${record.externalId}`)
    );

    if (toInsert.length > 0) {
      const insertRows = toInsert.map((record) => ({
        id: randomUUID(),
        ...toUpsertRow(record, input.now),
        created_at: input.now,
      }));
      const { error } = await supabase.from("jobs").insert(insertRows);
      if (error) {
        throw new Error(error.message);
      }
    }

    if (toUpdate.length > 0) {
      const updates = toUpdate.map((record) =>
        supabase
          .from("jobs")
          .update(toUpsertRow(record, input.now))
          .eq("source", record.source)
          .eq("external_id", record.externalId)
      );
      const results = await Promise.all(updates);
      for (const result of results) {
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    }

    return { created: toInsert.length, updated: toUpdate.length };
  },
});
