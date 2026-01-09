import { supabase } from "@/src/adapters/supabase/client";
import { job } from "@/src/domain/entities/job";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";

type jobRow = {
  id: string;
  company: string;
  role: string;
  source: string;
  location: string;
  seniority: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const toJob = (row: jobRow): job => ({
  id: row.id,
  company: row.company,
  role: row.role,
  source: row.source,
  location: row.location,
  seniority: row.seniority,
  tags: row.tags ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
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
});
