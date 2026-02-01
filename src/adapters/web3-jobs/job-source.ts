import { jobSource, jobSourceRecord } from "@/src/ports/job-source";

type web3Job = {
  id?: number | string;
  title?: string;
  company?: string;
  location?: string;
  country?: string;
  city?: string;
  apply_url?: string;
  tags?: unknown;
  description?: string;
  date?: string;
  date_epoch?: number;
};

const SOURCE = "Web3";
const BASE_URL = "https://web3.career/api/v1";
const includeKeywords = ["frontend", "front-end", "react"];

const toSearchText = (value: string) => value.toLowerCase();

const shouldInclude = (record: jobSourceRecord) => {
  const haystack = [record.role, record.company, ...record.tags]
    .map(toSearchText)
    .join(" ");
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

const toPublishedAt = (job: web3Job) => {
  if (typeof job.date_epoch === "number" && Number.isFinite(job.date_epoch)) {
    const ms = job.date_epoch < 1e12 ? job.date_epoch * 1000 : job.date_epoch;
    const parsed = new Date(ms);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  if (job.date) {
    const parsed = new Date(job.date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return null;
};

const toLocation = (job: web3Job) => {
  if (job.location?.trim()) return job.location.trim();
  const parts = [job.city, job.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());
  return parts.length > 0 ? parts.join(", ") : "Remote";
};

const toSourceRecord = (job: web3Job): jobSourceRecord | null => {
  const title = job.title?.trim();
  const company = job.company?.trim();
  const applyUrl = job.apply_url?.trim();
  if (!job.id || !title || !company || !applyUrl) return null;

  return {
    externalId: String(job.id),
    source: SOURCE,
    role: title,
    company,
    location: toLocation(job),
    seniority: normalizeSeniority(title),
    tags: toTags(job.tags),
    description: job.description?.trim() ?? null,
    sourceUrl: applyUrl,
    publishedAt: toPublishedAt(job),
  };
};

const buildUrl = (token: string, limit?: number) => {
  const url = new URL(BASE_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("remote", "true");
  url.searchParams.set("tag", "front-end");
  if (limit) {
    url.searchParams.set("limit", String(limit));
  }
  return url.toString();
};

export const createWeb3JobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) return [];

    const token = process.env.WEB3_CAREER_TOKEN?.trim();
    if (!token) {
      throw new Error("Missing WEB3_CAREER_TOKEN.");
    }

    const response = await fetch(buildUrl(token, query.limit));
    if (!response.ok) {
      throw new Error("Failed to fetch Web3 jobs.");
    }

    const payload = (await response.json()) as unknown;
    const jobs = Array.isArray(payload) ? payload[2] : null;
    if (!Array.isArray(jobs)) {
      console.warn("[Web3] Unexpected payload shape.", {
        hasPayload: Boolean(payload),
      });
      return [];
    }

    const records = jobs
      .map(toSourceRecord)
      .filter((record): record is jobSourceRecord => Boolean(record))
      .filter(shouldInclude);

    const limit = typeof query.limit === "number" ? query.limit : undefined;
    return limit ? records.slice(0, limit) : records;
  },
});
