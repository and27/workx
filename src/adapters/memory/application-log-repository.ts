import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import {
  applicationLogRepository,
  listApplicationLogsQuery,
} from "@/src/ports/application-log-repository";
import { memoryStore } from "@/src/adapters/memory/store";

export const createMemoryApplicationLogRepository = (
  store: memoryStore
): applicationLogRepository => ({
  async listByApplicationId(query: listApplicationLogsQuery) {
    return store.applicationLogs.filter(
      (entry) => entry.applicationId === query.applicationId
    );
  },
  async create(query: { entry: applicationLogEntry }) {
    store.applicationLogs.push(query.entry);
  },
});
