import { job } from "@/src/domain/entities/job";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";
import { memoryStore } from "@/src/adapters/memory/store";

const matchesSearch = (jobRecord: job, search: string) => {
  const normalized = search.toLowerCase();
  return (
    jobRecord.company.toLowerCase().includes(normalized) ||
    jobRecord.role.toLowerCase().includes(normalized)
  );
};

const matchesTags = (jobRecord: job, tags: string[]) =>
  tags.every((tag) => jobRecord.tags.includes(tag));

export const createMemoryJobRepository = (
  store: memoryStore
): jobRepository => ({
  async list(query: listJobsQuery) {
    const search = query.search?.trim();
    const tags = query.tags?.filter(Boolean) ?? [];
    return store.jobs.filter((record) => {
      if (search && !matchesSearch(record, search)) {
        return false;
      }
      if (query.seniority && record.seniority !== query.seniority) {
        return false;
      }
      if (query.source && record.source !== query.source) {
        return false;
      }
      if (tags.length > 0 && !matchesTags(record, tags)) {
        return false;
      }
      return true;
    });
  },
  async getById(query: { id: string }) {
    return store.jobs.find((record) => record.id === query.id) ?? null;
  },
});
