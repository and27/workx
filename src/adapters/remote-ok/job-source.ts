import { jobSource, jobSourceRecord } from "@/src/ports/job-source";

type remoteOkJob = {
  id?: number | string;
  date?: string;
  company?: string;
  position?: string;
  location?: string;
  tags?: unknown;
  description?: string;
  url?: string;
  apply_url?: string;
};

const SOURCE = "Remote OK";
const API_URL = "https://remoteok.com/api";
const includeKeywords = ["frontend", "front-end", "react", "ui", "ux", "design"];
const excludeKeywords = [
  "sales",
  "marketing",
  "recruiter",
  "account executive",
];

const toSearchText = (value: string) => value.toLowerCase();

const shouldInclude = (record: jobSourceRecord) => {
  const haystack = [record.role, record.company, ...record.tags]
    .map(toSearchText)
    .join(" ");
  if (excludeKeywords.some((keyword) => haystack.includes(keyword))) {
    return false;
  }
  return includeKeywords.some((keyword) => haystack.includes(keyword));
};

const toTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeSeniority = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("intern")) return "Intern";
  if (normalized.includes("junior") || normalized.includes("jr"))
    return "Junior";
  if (normalized.includes("senior") || normalized.includes("sr"))
    return "Senior";
  if (
    normalized.includes("staff") ||
    normalized.includes("principal") ||
    normalized.includes("lead")
  ) {
    return "Lead";
  }
  return "Mid";
};

const toPublishedAt = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toSourceRecord = (job: remoteOkJob): jobSourceRecord | null => {
  const role = job.position?.trim();
  const company = job.company?.trim();
  const sourceUrl = job.url?.trim() || job.apply_url?.trim();
  if (!job.id || !role || !company || !sourceUrl) return null;

  return {
    externalId: String(job.id),
    source: SOURCE,
    role,
    company,
    location: job.location?.trim() || "Remote",
    seniority: normalizeSeniority(role),
    tags: toTags(job.tags),
    description: job.description?.trim() ?? null,
    sourceUrl,
    publishedAt: toPublishedAt(job.date),
  };
};

const isJobRecord = (item: unknown): item is remoteOkJob => {
  if (!item || typeof item !== "object") return false;
  const record = item as remoteOkJob;
  return Boolean(record.id && record.position && record.company);
};

export const createRemoteOkJobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) return [];

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch Remote OK jobs.");
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      throw new Error("Unexpected Remote OK payload.");
    }

    const records = payload
      .filter(isJobRecord)
      .map(toSourceRecord)
      .filter((record): record is jobSourceRecord => Boolean(record))
      .filter(shouldInclude);

    const limit = typeof query.limit === "number" ? query.limit : undefined;
    return limit ? records.slice(0, limit) : records;
  },
});
