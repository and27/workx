import { supabase } from "@/src/adapters/supabase/client";
import { application } from "@/src/domain/entities/application";
import { applicationStatus } from "@/src/domain/types/application-status";
import { dateOnly } from "@/src/domain/types/date-only";
import { priority } from "@/src/domain/types/priority";
import {
  applicationRepository,
  applicationUpdatePatch,
  listApplicationsQuery,
} from "@/src/ports/application-repository";

type applicationRow = {
  id: string;
  company: string;
  role: string;
  status: applicationStatus;
  priority: priority;
  next_action_at: dateOnly | null;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
  job_id: string | null;
};

const toApplication = (row: applicationRow): application => ({
  id: row.id,
  company: row.company,
  role: row.role,
  status: row.status,
  priority: row.priority,
  nextActionAt: row.next_action_at,
  source: row.source,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  jobId: row.job_id,
});

const toPatchRow = (patch: applicationUpdatePatch) => {
  const row: Record<string, unknown> = {};

  if (patch.status !== undefined) {
    row.status = patch.status;
  }
  if (patch.priority !== undefined) {
    row.priority = patch.priority;
  }
  if (patch.nextActionAt !== undefined) {
    row.next_action_at = patch.nextActionAt;
  }
  if (patch.notes !== undefined) {
    row.notes = patch.notes;
  }
  if (patch.updatedAt !== undefined) {
    row.updated_at = patch.updatedAt;
  }

  return row;
};

export const createSupabaseApplicationRepository = (): applicationRepository => ({
  async list(query: listApplicationsQuery) {
    let builder = supabase
      .from("applications")
      .select(
        "id,company,role,status,priority,next_action_at,source,notes,created_at,updated_at,job_id"
      )
      .order("updated_at", { ascending: false });
    const search = query.search?.trim();
    if (search) {
      builder = builder.or(
        `company.ilike.%${search}%,role.ilike.%${search}%`
      );
    }
    if (query.status) {
      builder = builder.eq("status", query.status);
    }
    if (query.priority) {
      builder = builder.eq("priority", query.priority);
    }
    if (query.updatedAfter) {
      builder = builder.gte("updated_at", query.updatedAfter);
    }

    const { data, error } = await builder;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => toApplication(row as applicationRow));
  },
  async getById(query: { id: string }) {
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id,company,role,status,priority,next_action_at,source,notes,created_at,updated_at,job_id"
      )
      .eq("id", query.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return data ? toApplication(data as applicationRow) : null;
  },
  async create(query: { application: application }) {
    const record = query.application;
    const { error } = await supabase.from("applications").insert({
      id: record.id,
      company: record.company,
      role: record.role,
      status: record.status,
      priority: record.priority,
      next_action_at: record.nextActionAt,
      source: record.source,
      notes: record.notes,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      job_id: record.jobId,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
  async update(query: { id: string; patch: applicationUpdatePatch }) {
    const { data, error } = await supabase
      .from("applications")
      .update(toPatchRow(query.patch))
      .eq("id", query.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return toApplication(data as applicationRow);
  },
});
