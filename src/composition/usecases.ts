import { getRepositories } from "@/src/composition/repositories";
import { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
import { createGetApplicationUseCase } from "@/src/services/usecases/get-application";
import { createListApplicationLogsUseCase } from "@/src/services/usecases/list-application-logs";
import { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";
import { createListJobsUseCase } from "@/src/services/usecases/list-jobs";
import { updateApplicationUseCase } from "@/src/services/usecases/update-application";
import { createIngestJobsUseCase } from "@/src/services/usecases/ingest-jobs";

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
    listJobs: createListJobsUseCase({
      jobRepository: repositories.jobRepository,
    }),
    ingestJobs: createIngestJobsUseCase({
      jobSource: repositories.jobSource,
      jobRepository: repositories.jobRepository,
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
    getApplication: createGetApplicationUseCase({
      applicationRepository: repositories.applicationRepository,
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
