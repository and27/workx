import {
  jobSource,
  jobSourceQuery,
  jobSourceRecord,
} from "@/src/ports/job-source";

type jobSourceEntry = {
  source: string;
  adapter: jobSource;
};

const normalizeSource = (value: string) => value.trim().toLowerCase();
const normalizeLimit = (value: unknown, max = 100) => {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      value = parsed;
    }
  }
  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value)) return undefined;
  const floored = Math.floor(value);
  if (floored <= 0) return undefined;
  return Math.min(floored, max);
};

const sortByPublishedAtDesc = (
  left: jobSourceRecord,
  right: jobSourceRecord
) => {
  if (!left.publishedAt && !right.publishedAt) return 0;
  if (!left.publishedAt) return 1;
  if (!right.publishedAt) return -1;
  return right.publishedAt.localeCompare(left.publishedAt);
};

const dedupeRecords = (records: jobSourceRecord[]) => {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = `${record.source}:${record.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const createJobSourceRouter = (
  entries: jobSourceEntry[]
): jobSource => ({
  list: async (query: jobSourceQuery = {}) => {
    if (entries.length === 0) {
      return [];
    }

    const limit = normalizeLimit(query.limit);
    const rawSource = query.source?.trim();
    const source = rawSource ? normalizeSource(rawSource) : undefined;

    if (source && source !== "all") {
      const entry = entries.find(
        (item) => normalizeSource(item.source) === source
      );
      if (!entry) return [];
      return entry.adapter.list({ ...query, source: entry.source, limit });
    }

    const results = await Promise.all(
      entries.map((entry) =>
        entry.adapter.list({ ...query, source: entry.source, limit })
      )
    );

    const merged = dedupeRecords(results.flat()).sort(sortByPublishedAtDesc);
    return limit ? merged.slice(0, limit) : merged;
  },
});
