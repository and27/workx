import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";

export type job = {
  id: string;
  company: string;
  role: string;
  source: string;
  sourceUrl: string | null;
  externalId: string | null;
  location: string;
  seniority: string;
  tags: string[];
  description: string | null;
  triageStatus: triageStatus | null;
  triageReasons: string[] | null;
  triagedAt: isoDateTime | null;
  triageProvider: triageProvider | null;
  triageVersion: number | null;
  rankScore: number | null;
  rankReason: string | null;
  rankProvider: triageProvider | null;
  rankVersion: number | null;
  needsRetriage?: boolean;
  publishedAt: isoDateTime | null;
  createdAt: isoDateTime;
  updatedAt: isoDateTime;
};
