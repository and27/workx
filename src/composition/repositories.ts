import { createMemoryApplicationLogRepository } from "@/src/adapters/memory/application-log-repository";
import { createMemoryApplicationRepository } from "@/src/adapters/memory/application-repository";
import { createMemoryJobRepository } from "@/src/adapters/memory/job-repository";
import {
  seedApplicationLogs,
  seedApplications,
  seedJobs,
} from "@/src/adapters/memory/seed";
import { memoryStore } from "@/src/adapters/memory/store";
import { createJobSourceRouter } from "@/src/adapters/job-source-router";
import { createRemotiveJobSource } from "@/src/adapters/remotive/job-source";
import { createRemoteOkJobSource } from "@/src/adapters/remote-ok/job-source";
import { createJobTriageAdapter } from "@/src/adapters/triage/job-triage";
import { createWeb3JobSource } from "@/src/adapters/web3-jobs/job-source";
import { createWwrJobSource } from "@/src/adapters/wwr/job-source";

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
    jobSource: createJobSourceRouter([
      { source: "Remotive", adapter: createRemotiveJobSource() },
      { source: "Remote OK", adapter: createRemoteOkJobSource() },
      { source: "Web3", adapter: createWeb3JobSource() },
      { source: "WWR", adapter: createWwrJobSource() },
    ]),
    jobTriage: createJobTriageAdapter(),
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
    jobSource: createJobSourceRouter([
      { source: "Remotive", adapter: createRemotiveJobSource() },
      { source: "Remote OK", adapter: createRemoteOkJobSource() },
      { source: "Web3", adapter: createWeb3JobSource() },
      { source: "WWR", adapter: createWwrJobSource() },
    ]),
    jobTriage: createJobTriageAdapter(),
  };
}
