import {
  ingestRunRepository,
  ingestRunRecord,
} from "@/src/ports/ingest-run-repository";
import { memoryStore } from "@/src/adapters/memory/store";
import { ingestRun } from "@/src/domain/entities/ingest-run";

let idCounter = 0;
const createId = () => {
  idCounter += 1;
  return `ingest-${Date.now()}-${idCounter}`;
};

export const createMemoryIngestRunRepository = (
  store: memoryStore
): ingestRunRepository => ({
  async count(query) {
    const since = query.since;
    return store.ingestRuns.filter((run) => run.createdAt >= since).length;
  },
  async create(record: ingestRunRecord) {
    const run: ingestRun = {
      id: createId(),
      source: record.source,
      status: record.status,
      created: record.created,
      updated: record.updated,
      error: record.error ?? null,
      createdAt: record.createdAt,
    };
    store.ingestRuns.push(run);
  },
});
