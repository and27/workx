import { applicationStatus } from "@/src/domain/types/application-status";
import { applicationRepository } from "@/src/ports/application-repository";
import { todayDateOnly } from "@/src/services/usecases/date-only";

export type homeOverview = {
  totalApplications: number;
  activeInterviews: number;
  overdueCount: number;
  thisWeek: number;
  latestApplicationId: string | null;
};

const ACTIVE_INTERVIEW_STATUSES: applicationStatus[] = ["screen", "tech"];
const NON_ARCHIVED_STATUSES: applicationStatus[] = [
  "saved",
  "applied",
  "screen",
  "tech",
  "offer",
  "rejected",
  "ghosted",
];

const subtractDays = (base: Date, days: number) =>
  new Date(base.getTime() - days * 24 * 60 * 60 * 1000);

export const createListHomeOverviewUseCase =
  (dependencies: { applicationRepository: applicationRepository }) =>
  async (): Promise<homeOverview> => {
    const today = todayDateOnly();
    const weekAgo = subtractDays(new Date(), 7).toISOString();
    const [totalApplications, activeInterviews, overdueCount, thisWeek, latestApplicationId] =
      await Promise.all([
        dependencies.applicationRepository.count({}),
        dependencies.applicationRepository.count({
          statusIn: ACTIVE_INTERVIEW_STATUSES,
        }),
        dependencies.applicationRepository.count({
          overdueDate: today,
          statusIn: NON_ARCHIVED_STATUSES,
        }),
        dependencies.applicationRepository.count({ updatedAfter: weekAgo }),
        dependencies.applicationRepository.getLatestId(),
      ]);

    return {
      totalApplications,
      activeInterviews,
      overdueCount,
      thisWeek,
      latestApplicationId,
    };
  };
