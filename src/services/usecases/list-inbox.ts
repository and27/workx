import { application } from "@/src/domain/entities/application";
import { applicationRepository } from "@/src/ports/application-repository";
import { compareDateOnly, todayDateOnly } from "@/src/services/usecases/date-only";

export type inboxGroups = {
  overdue: application[];
  today: application[];
  upcoming: application[];
};

export const createListInboxUseCase =
  (dependencies: { applicationRepository: applicationRepository }) =>
  async (): Promise<inboxGroups> => {
    const items = await dependencies.applicationRepository.list({});
    const today = todayDateOnly();

    return items.reduce<inboxGroups>(
      (groups, item) => {
        if (!item.nextActionAt) {
          return groups;
        }
        const comparison = compareDateOnly(item.nextActionAt, today);
        if (comparison < 0) {
          groups.overdue.push(item);
        } else if (comparison === 0) {
          groups.today.push(item);
        } else {
          groups.upcoming.push(item);
        }
        return groups;
      },
      { overdue: [], today: [], upcoming: [] }
    );
  };
