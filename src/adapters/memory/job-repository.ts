import { job } from "@/src/domain/entities/job";
import {
  jobRepository,
  jobTriageUpdate,
  jobUpsertRecord,
  listJobsQuery,
} from "@/src/ports/job-repository";
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

const toHex = (value: number, length: number) =>
  value.toString(16).padStart(length, "0");

const makeId = (seed: number) =>
  `${toHex(seed, 8)}-${toHex(seed, 4)}-${toHex(seed, 4)}-${toHex(
    seed,
    4
  )}-${toHex(seed, 12)}`;

let idCounter = 0;
const createId = () => {
  idCounter += 1;
  return makeId(Math.abs(Date.now() + idCounter));
};

const applyUpsert = (
  store: memoryStore,
  record: jobUpsertRecord,
  now: string
) => {
  const existing = store.jobs.find(
    (jobRecord) =>
      jobRecord.source === record.source &&
      jobRecord.externalId === record.externalId
  );

  if (existing) {
    existing.company = record.company;
    existing.role = record.role;
    existing.location = record.location;
    existing.seniority = record.seniority;
    existing.tags = record.tags;
    existing.description = record.description;
    existing.sourceUrl = record.sourceUrl;
    existing.publishedAt = record.publishedAt;
    existing.updatedAt = now;
    return { created: false };
  }

  store.jobs.push({
    id: createId(),
    company: record.company,
    role: record.role,
    source: record.source,
    sourceUrl: record.sourceUrl,
    externalId: record.externalId,
    location: record.location,
    seniority: record.seniority,
    tags: record.tags,
    description: record.description,
    triageStatus: null,
    triageReasons: null,
    triagedAt: null,
    triageProvider: null,
    triageVersion: null,
    publishedAt: record.publishedAt,
    createdAt: now,
    updatedAt: now,
  });

  return { created: true };
};

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
      if (query.triageStatus) {
        if (query.triageStatus === "untriaged") {
          return record.triageStatus === null;
        }
        return record.triageStatus === query.triageStatus;
      }
      return true;
    });
  },
  async getById(query: { id: string }) {
    return store.jobs.find((record) => record.id === query.id) ?? null;
  },
  async upsertByExternalId(input: { jobs: jobUpsertRecord[]; now: string }) {
    const results = input.jobs.map((record) =>
      applyUpsert(store, record, input.now)
    );
    const created = results.filter((result) => result.created).length;
    return { created, updated: input.jobs.length - created };
  },
  async updateTriage(input: { id: string; patch: jobTriageUpdate }) {
    const index = store.jobs.findIndex((record) => record.id === input.id);
    if (index < 0) {
      throw new Error(`Job not found: ${input.id}`);
    }
    const current = store.jobs[index];
    const updated = {
      ...current,
      triageStatus: input.patch.triageStatus,
      triageReasons: input.patch.triageReasons,
      triagedAt: input.patch.triagedAt,
      triageProvider: input.patch.triageProvider,
      triageVersion: input.patch.triageVersion,
    };
    store.jobs[index] = updated;
    return updated;
  },
});
