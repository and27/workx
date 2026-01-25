import { isoDateTime } from "@/src/domain/types/iso-date-time";

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
  publishedAt: isoDateTime | null;
  createdAt: isoDateTime;
  updatedAt: isoDateTime;
};
