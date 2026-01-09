export type { inboxGroups } from "@/src/services/usecases/list-inbox";
export type { listApplicationsInput } from "@/src/services/usecases/list-applications";
export type { listJobsInput } from "@/src/services/usecases/list-jobs";
export type { getApplicationInput } from "@/src/services/usecases/get-application";
export type {
  listApplicationLogsInput,
} from "@/src/services/usecases/list-application-logs";
export type {
  createApplicationFromJobInput,
  createApplicationFromJobDeps,
} from "@/src/services/usecases/create-application-from-job";
export type {
  updateApplicationInput,
  updateApplicationDeps,
} from "@/src/services/usecases/update-application";
export type { result, resultErr, resultOk } from "@/src/services/usecases/result";
export { createListInboxUseCase } from "@/src/services/usecases/list-inbox";
export { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
export { createListJobsUseCase } from "@/src/services/usecases/list-jobs";
export { createGetApplicationUseCase } from "@/src/services/usecases/get-application";
export { createListApplicationLogsUseCase } from "@/src/services/usecases/list-application-logs";
export { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
export { updateApplicationUseCase } from "@/src/services/usecases/update-application";
export { ok, err } from "@/src/services/usecases/result";
