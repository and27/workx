import { supabase } from "@/src/adapters/supabase/client";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import {
  applicationLogRepository,
  listApplicationLogsQuery,
} from "@/src/ports/application-log-repository";

type applicationLogRow = {
  id: string;
  application_id: string;
  type: applicationLogEntry["type"];
  message: string;
  created_at: string;
};

const toLogEntry = (row: applicationLogRow): applicationLogEntry => ({
  id: row.id,
  applicationId: row.application_id,
  type: row.type,
  message: row.message,
  createdAt: row.created_at,
});

export const createSupabaseApplicationLogRepository =
  (): applicationLogRepository => ({
    async listByApplicationId(query: listApplicationLogsQuery) {
      const { data, error } = await supabase
        .from("application_logs")
        .select("*")
        .eq("application_id", query.applicationId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []).map((row) => toLogEntry(row as applicationLogRow));
    },
    async create(query: { entry: applicationLogEntry }) {
      const { error } = await supabase.from("application_logs").insert({
        id: query.entry.id,
        application_id: query.entry.applicationId,
        type: query.entry.type,
        message: query.entry.message,
        created_at: query.entry.createdAt,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });
