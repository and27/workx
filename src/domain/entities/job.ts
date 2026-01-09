import { isoDateTime } from "@/src/domain/types/iso-date-time";

export type job = {
  id: string;
  company: string;
  role: string;
  source: string;
  location: string;
  seniority: string;
  tags: string[];
  createdAt: isoDateTime;
  updatedAt: isoDateTime;
};
