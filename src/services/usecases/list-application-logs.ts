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
    return [...entries].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    );
  };
