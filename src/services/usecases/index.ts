export type { inboxGroups } from "@/src/services/usecases/list-inbox";
export type { listApplicationsInput } from "@/src/services/usecases/list-applications";
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
export { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";
export { updateApplicationUseCase } from "@/src/services/usecases/update-application";
export { ok, err } from "@/src/services/usecases/result";
