import { application } from "@/src/domain/entities/application";
import { applicationStatus } from "@/src/domain/types/application-status";
import { dateOnly } from "@/src/domain/types/date-only";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { priority } from "@/src/domain/types/priority";

export type listApplicationsQuery = {
  search?: string;
  status?: applicationStatus;
  priority?: priority;
};

export type applicationUpdatePatch = {
  status?: applicationStatus;
  priority?: priority;
  nextActionAt?: dateOnly | null;
  notes?: string;
  updatedAt: isoDateTime;
};

export interface applicationRepository {
  list(query: listApplicationsQuery): Promise<application[]>;
  getById(query: { id: string }): Promise<application | null>;
  create(query: { application: application }): Promise<void>;
  update(query: { id: string; patch: applicationUpdatePatch }): Promise<application>;
}
