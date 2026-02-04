import { getRepositories } from "@/src/composition/repositories";
import { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
import { createGetApplicationUseCase } from "@/src/services/usecases/get-application";
import { createGetJobUseCase } from "@/src/services/usecases/get-job";
import { createListApplicationLogsUseCase } from "@/src/services/usecases/list-application-logs";
import { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";
import { createListInboxOverviewUseCase } from "@/src/services/usecases/list-inbox-overview";
import { createListHomeOverviewUseCase } from "@/src/services/usecases/list-home-overview";
import { createListJobsUseCase } from "@/src/services/usecases/list-jobs";
import { createListJobsPageUseCase } from "@/src/services/usecases/list-jobs-page";
import { createListJobSourcesUseCase } from "@/src/services/usecases/list-job-sources";
import { updateApplicationUseCase } from "@/src/services/usecases/update-application";
import { createIngestJobsUseCase } from "@/src/services/usecases/ingest-jobs";
import { createIngestJobsWithCapUseCase } from "@/src/services/usecases/ingest-jobs-with-cap";
import { createGetIngestStatusUseCase } from "@/src/services/usecases/ingest-status";
import { createArchiveApplicationUseCase } from "@/src/services/usecases/archive-application";
import { createTriageJobsUseCase } from "@/src/services/usecases/triage-jobs";
import { createRankShortlistUseCase } from "@/src/services/usecases/rank-shortlist";
import { createManualJobUseCase } from "@/src/services/usecases/create-manual-job";
import { defaultUserProfile } from "@/src/composition/user-profile";

let _usecases: Awaited<ReturnType<typeof buildUseCases>> | null = null;

async function buildUseCases() {
  const repositories = await getRepositories();

  return {
    listApplications: createListApplicationsUseCase({
      applicationRepository: repositories.applicationRepository,
    }),
    listInbox: createListInboxUseCase({
      applicationRepository: repositories.applicationRepository,
    }),
    listInboxOverview: createListInboxOverviewUseCase({
      applicationRepository: repositories.applicationRepository,
    }),
    listHomeOverview: createListHomeOverviewUseCase({
      applicationRepository: repositories.applicationRepository,
    }),
    listJobs: createListJobsUseCase({
      jobRepository: repositories.jobRepository,
      profile: defaultUserProfile,
    }),
    listJobsPage: createListJobsPageUseCase({
      jobRepository: repositories.jobRepository,
      profile: defaultUserProfile,
    }),
    listJobSources: createListJobSourcesUseCase({
      jobRepository: repositories.jobRepository,
    }),
    ingestJobs: createIngestJobsUseCase({
      jobSource: repositories.jobSource,
      jobRepository: repositories.jobRepository,
    }),
    ingestJobsWithCap: createIngestJobsWithCapUseCase({
      jobSource: repositories.jobSource,
      jobRepository: repositories.jobRepository,
      ingestRunRepository: repositories.ingestRunRepository,
    }),
    getIngestStatus: createGetIngestStatusUseCase({
      ingestRunRepository: repositories.ingestRunRepository,
    }),
    triageJobs: createTriageJobsUseCase({
      jobRepository: repositories.jobRepository,
      jobTriage: repositories.jobTriage,
      profile: defaultUserProfile,
      ollamaConfigured: Boolean(
        process.env.OLLAMA_BASE_URL?.trim() &&
          process.env.OLLAMA_MODEL?.trim()
      ),
    }),
    rankShortlist: createRankShortlistUseCase({
      jobRepository: repositories.jobRepository,
      jobRanker: repositories.jobRanker,
      profile: defaultUserProfile,
    }),
    createManualJob: createManualJobUseCase({
      jobRepository: repositories.jobRepository,
      jobTriage: repositories.jobTriage,
      profile: defaultUserProfile,
    }),
    createApplicationFromJob: createApplicationFromJobUseCase({
      applicationRepository: repositories.applicationRepository,
      applicationLogRepository: repositories.applicationLogRepository,
      jobRepository: repositories.jobRepository,
    }),
    updateApplication: updateApplicationUseCase({
      applicationRepository: repositories.applicationRepository,
      applicationLogRepository: repositories.applicationLogRepository,
    }),
    archiveApplication: createArchiveApplicationUseCase({
      applicationRepository: repositories.applicationRepository,
      applicationLogRepository: repositories.applicationLogRepository,
    }),
    getApplication: createGetApplicationUseCase({
      applicationRepository: repositories.applicationRepository,
    }),
    getJob: createGetJobUseCase({
      jobRepository: repositories.jobRepository,
    }),
    listApplicationLogs: createListApplicationLogsUseCase({
      applicationLogRepository: repositories.applicationLogRepository,
    }),
  };
}

export async function getUseCases() {
  if (!_usecases) _usecases = await buildUseCases();
  return _usecases;
}
