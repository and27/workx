import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { ingestRunStatus } from "@/src/domain/entities/ingest-run";

export type ingestRunRecord = {
  source: string | null;
  status: ingestRunStatus;
  created: number;
  updated: number;
  error: string | null;
  createdAt: isoDateTime;
};

export type countIngestRunsQuery = {
  since: isoDateTime;
};

export interface ingestRunRepository {
  count(query: countIngestRunsQuery): Promise<number>;
  create(record: ingestRunRecord): Promise<void>;
}
