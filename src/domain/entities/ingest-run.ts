import { isoDateTime } from "@/src/domain/types/iso-date-time";

export type ingestRunStatus = "success" | "failed";

export type ingestRun = {
  id: string;
  source: string | null;
  status: ingestRunStatus;
  created: number;
  updated: number;
  error: string | null;
  createdAt: isoDateTime;
};
