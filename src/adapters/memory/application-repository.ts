import { application } from "@/src/domain/entities/application";
import {
  applicationRepository,
  applicationUpdatePatch,
  countApplicationsQuery,
  listApplicationsQuery,
} from "@/src/ports/application-repository";
import { memoryStore } from "@/src/adapters/memory/store";

const matchesSearch = (applicationRecord: application, search: string) => {
  const normalized = search.toLowerCase();
  return (
    applicationRecord.company.toLowerCase().includes(normalized) ||
    applicationRecord.role.toLowerCase().includes(normalized)
  );
};

export const createMemoryApplicationRepository = (
  store: memoryStore
): applicationRepository => ({
  async list(query: listApplicationsQuery) {
    const search = query.search?.trim();
    const updatedAfter = query.updatedAfter;
    const jobIdSet = query.jobIds ? new Set(query.jobIds) : null;
    return store.applications.filter((record) => {
      if (jobIdSet) {
        if (jobIdSet.size === 0) return false;
        if (!record.jobId || !jobIdSet.has(record.jobId)) return false;
      }
      if (search && !matchesSearch(record, search)) {
        return false;
      }
      if (query.status && record.status !== query.status) {
        return false;
      }
      if (query.priority && record.priority !== query.priority) {
        return false;
      }
      if (updatedAfter && record.updatedAt < updatedAfter) {
        return false;
      }
      return true;
    });
  },
  async count(query: countApplicationsQuery) {
    const updatedAfter = query.updatedAfter
      ? new Date(query.updatedAfter).getTime()
      : null;
    return store.applications.filter((record) => {
      if (query.statusIn) {
        if (query.statusIn.length === 0) return false;
        const allowed = new Set(query.statusIn);
        if (!allowed.has(record.status)) {
          return false;
        }
      }
      if (updatedAfter !== null) {
        if (new Date(record.updatedAt).getTime() < updatedAfter) {
          return false;
        }
      }
      if (query.overdueDate) {
        if (!record.nextActionAt || record.nextActionAt >= query.overdueDate) {
          return false;
        }
      }
      return true;
    }).length;
  },
  async getLatestId() {
    if (store.applications.length === 0) return null;
    const sorted = [...store.applications].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    );
    return sorted[0]?.id ?? null;
  },
  async getById(query: { id: string }) {
    return store.applications.find((record) => record.id === query.id) ?? null;
  },
  async create(query: { application: application }) {
    store.applications.push(query.application);
  },
  async update(query: { id: string; patch: applicationUpdatePatch }) {
    const index = store.applications.findIndex(
      (record) => record.id === query.id
    );
    if (index < 0) {
      throw new Error(`Application not found: ${query.id}`);
    }
    const current = store.applications[index];
    const updated = {
      ...current,
      ...query.patch,
    };
    store.applications[index] = updated;
    return updated;
  },
});
