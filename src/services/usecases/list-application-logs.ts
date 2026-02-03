import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import {
  applicationLogRepository,
  listApplicationLogsQuery,
} from "@/src/ports/application-log-repository";

export type listApplicationLogsInput = listApplicationLogsQuery;

export const createListApplicationLogsUseCase =
  (dependencies: { applicationLogRepository: applicationLogRepository }) =>
  async (
    input: listApplicationLogsInput
  ): Promise<applicationLogEntry[]> => {
    const entries = await dependencies.applicationLogRepository.listByApplicationId(
      input
    );
    const sorted = [...entries].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    );
    const limit =
      typeof input.limit === "number" && Number.isFinite(input.limit)
        ? Math.max(0, Math.floor(input.limit))
        : undefined;
    if (limit === undefined) {
      return sorted;
    }
    return sorted.slice(0, limit);
  };
