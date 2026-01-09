import { applicationStatus } from "@/src/domain/types/application-status";
import { dateOnly } from "@/src/domain/types/date-only";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { priority } from "@/src/domain/types/priority";

export type application = {
  id: string;
  company: string;
  role: string;
  status: applicationStatus;
  priority: priority;
  nextActionAt: dateOnly | null;
  source: string;
  notes: string;
  createdAt: isoDateTime;
  updatedAt: isoDateTime;
  jobId: string | null;
};
