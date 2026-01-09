import { repositories } from "@/src/composition/repositories";
import { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
import { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";
import { createListJobsUseCase } from "@/src/services/usecases/list-jobs";
import { updateApplicationUseCase } from "@/src/services/usecases/update-application";

export const listApplications = createListApplicationsUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listInbox = createListInboxUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listJobs = createListJobsUseCase({
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
