import { repositories } from "@/src/composition/repositories";
import { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
import { createGetApplicationUseCase } from "@/src/services/usecases/get-application";
import { createListApplicationLogsUseCase } from "@/src/services/usecases/list-application-logs";
import { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";
import { createListJobsUseCase } from "@/src/services/usecases/list-jobs";
import { updateApplicationUseCase } from "@/src/services/usecases/update-application";
import { createIngestJobsUseCase } from "@/src/services/usecases/ingest-jobs";

export const listApplications = createListApplicationsUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listInbox = createListInboxUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listJobs = createListJobsUseCase({
  jobRepository: repositories.jobRepository,
});

export const ingestJobs = createIngestJobsUseCase({
  jobSource: repositories.jobSource,
  jobRepository: repositories.jobRepository,
});

export const createApplicationFromJob = createApplicationFromJobUseCase({
  applicationRepository: repositories.applicationRepository,
  applicationLogRepository: repositories.applicationLogRepository,
  jobRepository: repositories.jobRepository,
});

export const updateApplication = updateApplicationUseCase({
  applicationRepository: repositories.applicationRepository,
  applicationLogRepository: repositories.applicationLogRepository,
});

export const getApplication = createGetApplicationUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listApplicationLogs = createListApplicationLogsUseCase({
  applicationLogRepository: repositories.applicationLogRepository,
});
