import { createMemoryApplicationLogRepository } from "@/src/adapters/memory/application-log-repository";
import { createMemoryApplicationRepository } from "@/src/adapters/memory/application-repository";
import { createMemoryJobRepository } from "@/src/adapters/memory/job-repository";
import {
  seedApplicationLogs,
  seedApplications,
  seedJobs,
} from "@/src/adapters/memory/seed";
import { memoryStore } from "@/src/adapters/memory/store";

const store: memoryStore = {
  applications: [...seedApplications],
  applicationLogs: [...seedApplicationLogs],
  jobs: [...seedJobs],
};

export const repositories = {
  applicationRepository: createMemoryApplicationRepository(store),
  applicationLogRepository: createMemoryApplicationLogRepository(store),
  jobRepository: createMemoryJobRepository(store),
};
