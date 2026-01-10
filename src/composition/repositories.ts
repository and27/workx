import { createMemoryApplicationLogRepository } from "@/src/adapters/memory/application-log-repository";
import { createMemoryApplicationRepository } from "@/src/adapters/memory/application-repository";
import { createMemoryJobRepository } from "@/src/adapters/memory/job-repository";
import {
  seedApplicationLogs,
  seedApplications,
  seedJobs,
} from "@/src/adapters/memory/seed";
import { memoryStore } from "@/src/adapters/memory/store";
import { createRemotiveJobSource } from "@/src/adapters/remotive/job-source";

type globalStore = { __workxMemoryStore?: memoryStore };

const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

const createMemoryRepositories = () => {
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

  return {
    applicationRepository: createMemoryApplicationRepository(store),
    applicationLogRepository: createMemoryApplicationLogRepository(store),
    jobRepository: createMemoryJobRepository(store),
    jobSource: createRemotiveJobSource(),
  };
};

export async function getRepositories() {
  if (!hasSupabaseConfig) return createMemoryRepositories();

  const { createSupabaseApplicationRepository } = await import(
    "@/src/adapters/supabase/application-repository"
  );
  const { createSupabaseApplicationLogRepository } = await import(
    "@/src/adapters/supabase/application-log-repository"
  );
  const { createSupabaseJobRepository } = await import(
    "@/src/adapters/supabase/job-repository"
  );

  return {
    applicationRepository: createSupabaseApplicationRepository(),
    applicationLogRepository: createSupabaseApplicationLogRepository(),
    jobRepository: createSupabaseJobRepository(),
    jobSource: createRemotiveJobSource(),
  };
}
