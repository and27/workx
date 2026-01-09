import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { job } from "@/src/domain/entities/job";

export type memoryStore = {
  applications: application[];
  applicationLogs: applicationLogEntry[];
  jobs: job[];
};
