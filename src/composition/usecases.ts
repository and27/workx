import { repositories } from "@/src/composition/repositories";
import { createListApplicationsUseCase } from "@/src/services/usecases/list-applications";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";

export const listApplications = createListApplicationsUseCase({
  applicationRepository: repositories.applicationRepository,
});

export const listInbox = createListInboxUseCase({
  applicationRepository: repositories.applicationRepository,
});
