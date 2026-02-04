import { supabase } from "@/src/adapters/supabase/client";
import {
  ingestRunRepository,
  ingestRunRecord,
} from "@/src/ports/ingest-run-repository";

type ingestRunRow = {
  id: string;
  source: string | null;
  status: string;
  created: number;
  updated: number;
  error: string | null;
  created_at: string;
};

export const createSupabaseIngestRunRepository = (): ingestRunRepository => ({
  async count(query) {
    const { count, error } = await supabase
      .from("ingest_runs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", query.since);

    if (error) {
      throw new Error(error.message);
    }
    return count ?? 0;
  },
  async create(record: ingestRunRecord) {
    const { error } = await supabase.from("ingest_runs").insert({
      source: record.source,
      status: record.status,
      created: record.created,
      updated: record.updated,
      error: record.error,
      created_at: record.createdAt,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
});
