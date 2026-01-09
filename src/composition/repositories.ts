import { createMemoryApplicationLogRepository } from "@/src/adapters/memory/application-log-repository";
import { createMemoryApplicationRepository } from "@/src/adapters/memory/application-repository";
import { createMemoryJobRepository } from "@/src/adapters/memory/job-repository";
import {
  seedApplicationLogs,
  seedApplications,
  seedJobs,
} from "@/src/adapters/memory/seed";
import { memoryStore } from "@/src/adapters/memory/store";

type globalStore = {
  __workxMemoryStore?: memoryStore;
};

const store =
  (globalThis as globalStore).__workxMemoryStore ??
  ({
    applications: [...seedApplications],
    applicationLogs: [...seedApplicationLogs],
    jobs: [...seedJobs],
  } satisfies memoryStore);

if (!(globalThis as globalStore).__workxMemoryStore) {
  (globalThis as globalStore).__workxMemoryStore = store;
}

export const repositories = {
  applicationRepository: createMemoryApplicationRepository(store),
  applicationLogRepository: createMemoryApplicationLogRepository(store),
  jobRepository: createMemoryJobRepository(store),
};
