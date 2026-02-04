import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { ingestRun } from "@/src/domain/entities/ingest-run";
import { job } from "@/src/domain/entities/job";

export type memoryStore = {
  applications: application[];
  applicationLogs: applicationLogEntry[];
  ingestRuns: ingestRun[];
  jobs: job[];
};
