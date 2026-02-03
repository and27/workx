import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";

export type listApplicationLogsQuery = {
  applicationId: string;
  limit?: number;
};

export interface applicationLogRepository {
  listByApplicationId(
    query: listApplicationLogsQuery
  ): Promise<applicationLogEntry[]>;
  create(query: { entry: applicationLogEntry }): Promise<void>;
}
