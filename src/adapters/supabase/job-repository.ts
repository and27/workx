import { randomUUID } from "crypto";
import { supabase } from "@/src/adapters/supabase/client";
import { job } from "@/src/domain/entities/job";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";
import {
  jobRepository,
  jobTriageUpdate,
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
  description: string | null;
  triage_status: string | null;
  triage_reasons: string[] | null;
  triaged_at: string | null;
  triage_provider: string | null;
  triage_version: number | null;
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
  description: row.description ?? null,
  triageStatus: toTriageStatus(row.triage_status),
  triageReasons: row.triage_reasons ?? null,
  triagedAt: row.triaged_at ?? null,
  triageProvider: toTriageProvider(row.triage_provider),
  triageVersion: row.triage_version ?? null,
  publishedAt: row.published_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toTriageStatus = (value: string | null): triageStatus | null => {
  if (value === "shortlist" || value === "maybe" || value === "reject") {
    return value;
  }
  return null;
};

const toTriageProvider = (value: string | null): triageProvider | null => {
  if (value === "ollama" || value === "openai") {
    return value;
  }
  return null;
};

const toUpsertRow = (record: jobUpsertRecord, now: string) => ({
  company: record.company,
  role: record.role,
  source: record.source,
  external_id: record.externalId,
  source_url: record.sourceUrl,
  location: record.location,
  seniority: record.seniority,
  tags: record.tags,
  description: record.description,
  published_at: record.publishedAt,
  updated_at: now,
});

export const createSupabaseJobRepository = (): jobRepository => ({
  async list(query: listJobsQuery) {
    let builder = supabase
      .from("jobs")
      .select(
        "id,company,role,source,source_url,external_id,location,seniority,tags,description,triage_status,triage_reasons,triaged_at,triage_provider,triage_version,published_at,created_at,updated_at"
      )
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
    if (query.triageStatus) {
      if (query.triageStatus === "untriaged") {
        builder = builder.is("triage_status", null);
      } else {
        builder = builder.eq("triage_status", query.triageStatus);
      }
    }

    const { data, error } = await builder;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => toJob(row as jobRow));
  },
  async listSources() {
    const { data, error } = await supabase
      .from("jobs")
      .select("source")
      .order("source", { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    const sources = (data ?? [])
      .map((row) => row.source)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(sources));
  },
  async getById(query: { id: string }) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id,company,role,source,source_url,external_id,location,seniority,tags,description,triage_status,triage_reasons,triaged_at,triage_provider,triage_version,published_at,created_at,updated_at"
      )
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
  async updateTriage(input: { id: string; patch: jobTriageUpdate }) {
    const { data, error } = await supabase
      .from("jobs")
      .update({
        triage_status: input.patch.triageStatus,
        triage_reasons: input.patch.triageReasons,
        triaged_at: input.patch.triagedAt,
        triage_provider: input.patch.triageProvider,
        triage_version: input.patch.triageVersion,
        updated_at: input.patch.triagedAt ?? new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(`Job not found: ${input.id}`);
    }
    return toJob(data as jobRow);
  },
});
