import { jobSource, jobSourceRecord } from "@/src/ports/job-source";

type remotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  tags: string[];
  candidate_required_location: string;
  publication_date: string;
  description?: string;
};

type remotiveResponse = {
  jobs: remotiveJob[];
};

const SOURCE = "Remotive";
const includeKeywords = ["frontend", "react", "ui", "ux", "product", "design"];
const excludeKeywords = ["sales", "marketing", "recruiter", "account executive"];

const toSearchText = (value: string) => value.toLowerCase();

const shouldInclude = (record: jobSourceRecord) => {
  const parts = [record.role, record.company, ...record.tags].map(toSearchText);
  const haystack = parts.join(" ");
  if (excludeKeywords.some((keyword) => haystack.includes(keyword))) {
    return false;
  }
  return includeKeywords.some((keyword) => haystack.includes(keyword));
};

const normalizeSeniority = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("intern")) {
    return "Intern";
  }
  if (normalized.includes("junior") || normalized.includes("jr")) {
    return "Junior";
  }
  if (normalized.includes("senior") || normalized.includes("sr")) {
    return "Senior";
  }
  if (
    normalized.includes("staff") ||
    normalized.includes("principal") ||
    normalized.includes("lead")
  ) {
    return "Lead";
  }
  return "Mid";
};

const toPublishedAt = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const toSourceRecord = (job: remotiveJob): jobSourceRecord => ({
  externalId: String(job.id),
  source: SOURCE,
  role: job.title,
  company: job.company_name,
  location: job.candidate_required_location || "Remoto",
  seniority: normalizeSeniority(job.title),
  tags: job.tags?.length
    ? job.tags
    : [job.category, job.job_type].filter(
        (value): value is string => Boolean(value)
      ),
  description: job.description ?? null,
  sourceUrl: job.url,
  publishedAt: toPublishedAt(job.publication_date),
});

export const createRemotiveJobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) {
      return [];
    }

    const response = await fetch("https://remotive.com/api/remote-jobs");
    if (!response.ok) {
      throw new Error("Failed to fetch Remotive jobs.");
    }

    const payload = (await response.json()) as remotiveResponse;
    const records = payload.jobs.map(toSourceRecord).filter(shouldInclude);
    const limited = query.limit ? records.slice(0, query.limit) : records;
    return limited;
  },
});
