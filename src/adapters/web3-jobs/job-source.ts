import { jobSource, jobSourceRecord } from "@/src/ports/job-source";
import {
  normalizeSeniority,
  toTags,
} from "@/src/adapters/job-source-helpers";

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
const isDebugEnabled = () => process.env.WEB3_DEBUG?.trim() === "true";
const getTag = () => {
  const tag = process.env.WEB3_TAG?.trim();
  return tag && tag.length > 0 ? tag : "react";
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

const MAX_LIMIT = 100;

const buildUrl = (token: string, tag: string, limit?: number) => {
  const url = new URL(BASE_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("remote", "true");
  url.searchParams.set("tag", tag);
  if (limit) {
    const capped = Math.min(limit, MAX_LIMIT);
    url.searchParams.set("limit", String(capped));
  }
  return url.toString();
};

const isJobLike = (value: unknown): value is web3Job => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as web3Job;
  return Boolean(
    candidate.id ||
      candidate.title ||
      candidate.company ||
      candidate.apply_url ||
      candidate.description,
  );
};

const toPublishedAtMs = (record: jobSourceRecord) => {
  if (!record.publishedAt) return null;
  const parsed = new Date(record.publishedAt);
  const ms = parsed.getTime();
  return Number.isNaN(ms) ? null : ms;
};

const sortByPublishedAtDesc = (
  left: jobSourceRecord,
  right: jobSourceRecord,
) => {
  const leftMs = toPublishedAtMs(left);
  const rightMs = toPublishedAtMs(right);
  if (leftMs === null && rightMs === null) return 0;
  if (leftMs === null) return 1;
  if (rightMs === null) return -1;
  return rightMs - leftMs;
};

const summarizePublishedAt = (records: jobSourceRecord[]) => {
  let oldestMs: number | null = null;
  let newestMs: number | null = null;
  let missing = 0;
  for (const record of records) {
    const ms = toPublishedAtMs(record);
    if (ms === null) {
      missing += 1;
      continue;
    }
    if (oldestMs === null || ms < oldestMs) oldestMs = ms;
    if (newestMs === null || ms > newestMs) newestMs = ms;
  }
  return {
    withPublishedAt: records.length - missing,
    withoutPublishedAt: missing,
    newestPublishedAt: newestMs ? new Date(newestMs).toISOString() : null,
    oldestPublishedAt: oldestMs ? new Date(oldestMs).toISOString() : null,
  };
};

export const createWeb3JobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) return [];

    const token = process.env.WEB3_CAREER_TOKEN?.trim();
    if (!token) {
      throw new Error("Missing WEB3_CAREER_TOKEN.");
    }

    const tag = getTag();
    const response = await fetch(buildUrl(token, tag, query.limit));
    if (!response.ok) {
      throw new Error("Failed to fetch Web3 jobs.");
    }

    const payload = (await response.json()) as unknown;
    let jobs: unknown = null;
    if (Array.isArray(payload)) {
      const jobLikeItems = payload.filter(isJobLike);
      if (jobLikeItems.length > 0) {
        jobs = jobLikeItems;
      } else {
        const nestedJobs = payload.find(
          (entry) => Array.isArray(entry) && entry.every(isJobLike),
        );
        jobs = nestedJobs ?? null;
      }
    } else if (payload && typeof payload === "object") {
      const candidate = payload as { jobs?: unknown; data?: unknown };
      jobs = candidate.jobs ?? candidate.data ?? null;
    }

    if (!Array.isArray(jobs)) {
      console.warn("[Web3] Unexpected payload shape.", {
        type: typeof payload,
        isArray: Array.isArray(payload),
      });
      return [];
    }

    const records = jobs
      .map(toSourceRecord)
      .filter((record): record is jobSourceRecord => Boolean(record));

    if (isDebugEnabled()) {
      console.info("[Web3] Ingest counts", {
        raw: jobs.length,
        mapped: records.length,
        limit: query.limit ?? null,
        tag,
        ...summarizePublishedAt(records),
      });
    }

    const limit = typeof query.limit === "number" ? query.limit : undefined;
    const ordered = records.slice().sort(sortByPublishedAtDesc);
    return limit ? ordered.slice(0, limit) : ordered;
  },
});
