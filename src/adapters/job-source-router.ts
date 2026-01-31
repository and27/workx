import { jobSource, jobSourceQuery } from "@/src/ports/job-source";

type jobSourceEntry = {
  source: string;
  adapter: jobSource;
};

const normalizeSource = (value: string) => value.trim().toLowerCase();

export const createJobSourceRouter = (
  entries: jobSourceEntry[]
): jobSource => ({
  list: async (query: jobSourceQuery = {}) => {
    if (entries.length === 0) {
      return [];
    }

    if (query.source) {
      const normalized = normalizeSource(query.source);
      const entry = entries.find(
        (item) => normalizeSource(item.source) === normalized
      );
      if (!entry) {
        return [];
      }
      return entry.adapter.list(query);
    }

    return entries[0].adapter.list(query);
  },
});
