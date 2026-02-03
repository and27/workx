import { application } from "@/src/domain/entities/application";
import { applicationRepository } from "@/src/ports/application-repository";
import { buildInboxGroups, inboxGroups } from "@/src/services/usecases/list-inbox";

export type inboxOverview = {
  inbox: inboxGroups;
  applications: application[];
};

export const createListInboxOverviewUseCase =
  (dependencies: { applicationRepository: applicationRepository }) =>
  async (): Promise<inboxOverview> => {
    const items = await dependencies.applicationRepository.list({});
    const sorted = [...items].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    );
    return {
      inbox: buildInboxGroups(sorted),
      applications: sorted,
    };
  };
