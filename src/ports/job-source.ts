import { isoDateTime } from "@/src/domain/types/iso-date-time";

export type jobSourceQuery = {
  // Use "all" (or omit) to fetch across all sources.
  source?: string;
  limit?: number;
};

export type jobSourceRecord = {
  externalId: string;
  source: string;
  role: string;
  company: string;
  location: string;
  seniority: string;
  tags: string[];
  description: string | null;
  sourceUrl: string;
  publishedAt: isoDateTime | null;
};

export type jobSource = {
  list: (query?: jobSourceQuery) => Promise<jobSourceRecord[]>;
};
