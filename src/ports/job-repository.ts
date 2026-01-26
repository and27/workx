import { job } from "@/src/domain/entities/job";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";

export type listJobsQuery = {
  search?: string;
  seniority?: string;
  source?: string;
  tags?: string[];
  triageStatus?: triageStatus | "untriaged";
};

export type jobUpsertRecord = {
  externalId: string;
  source: string;
  role: string;
  company: string;
  location: string;
  seniority: string;
  tags: string[];
  description: string | null;
  sourceUrl: string | null;
  publishedAt: isoDateTime | null;
};

export type jobTriageUpdate = {
  triageStatus: triageStatus | null;
  triageReasons: string[] | null;
  triagedAt: isoDateTime | null;
  triageProvider: triageProvider | null;
};

export type jobUpsertResult = {
  created: number;
  updated: number;
};

export interface jobRepository {
  list(query: listJobsQuery): Promise<job[]>;
  getById(query: { id: string }): Promise<job | null>;
  upsertByExternalId(input: {
    jobs: jobUpsertRecord[];
    now: isoDateTime;
  }): Promise<jobUpsertResult>;
  updateTriage(input: { id: string; patch: jobTriageUpdate }): Promise<job>;
}
