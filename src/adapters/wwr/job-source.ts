import Parser from "rss-parser";
import { jobSource, jobSourceRecord } from "@/src/ports/job-source";

const SOURCE = "WWR";
const FEED_URL =
  "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss";

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
  return !excludeKeywords.some((k) => haystack.includes(k));
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toPublishedAt = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
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

const splitOn = (value: string, delimiter: string) => {
  const index = value.indexOf(delimiter);
  if (index <= 0) return null;
  return [value.slice(0, index), value.slice(index + delimiter.length)];
};

const parseTitle = (title: string) => {
  const cleaned = title.trim();
  if (!cleaned) return { role: "Unknown role", company: "Unknown" };

  const colonSplit = splitOn(cleaned, ":");
  if (colonSplit) {
    const [company, role] = colonSplit.map((part) => part.trim());
    return { company: company || "Unknown", role: role || cleaned };
  }

  const lower = cleaned.toLowerCase();
  const atIndex = lower.lastIndexOf(" at ");
  if (atIndex > 0) {
    const role = cleaned.slice(0, atIndex).trim();
    const company = cleaned.slice(atIndex + 4).trim();
    return { company: company || "Unknown", role: role || cleaned };
  }

  const dashSplit = splitOn(cleaned, " - ");
  if (dashSplit) {
    const [left, right] = dashSplit.map((part) => part.trim());
    const roleHints = [
      "engineer",
      "developer",
      "designer",
      "product",
      "frontend",
      "front-end",
      "backend",
      "back-end",
      "full-stack",
      "full stack",
      "data",
      "qa",
      "ios",
      "android",
    ];
    const leftLooksRole = roleHints.some((hint) =>
      left.toLowerCase().includes(hint),
    );

    return leftLooksRole
      ? { role: left || cleaned, company: right || "Unknown" }
      : { company: left || "Unknown", role: right || cleaned };
  }

  return { role: cleaned, company: "Unknown" };
};

const extractLocation = (description: string | null) => {
  if (!description) return null;
  const text = stripHtml(description);
  const match = text.match(/location:\s*([^|•\n]+)/i);
  return match ? match[1].trim() : null;
};

// ---- rss-parser wiring ----
type ParsedItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  categories?: string[];
};

const parser = new Parser();

const toSourceRecord = (item: ParsedItem): jobSourceRecord | null => {
  const title = item.title?.trim();
  const link = item.link?.trim();
  if (!title || !link) return null;

  const guid = (item.guid ?? link).trim();
  const description =
    (item.content ?? item.contentSnippet ?? null)?.trim() ?? null;
  const categories = item.categories ?? [];

  const { role, company } = parseTitle(title);
  const location = extractLocation(description) ?? "Remote";

  return {
    externalId: guid,
    source: SOURCE,
    role,
    company,
    location,
    seniority: normalizeSeniority(title),
    tags: categories,
    description,
    sourceUrl: link,
    publishedAt: toPublishedAt(item.isoDate ?? item.pubDate),
  };
};

const toSafeLimit = (value: unknown, max = 50): number | null => {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  const floored = Math.floor(value);
  if (floored <= 0) return null;
  return Math.min(floored, max);
};

export const createWwrJobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) return [];

    const response = await fetch(FEED_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch WWR jobs.");
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    const items = (feed.items ?? []) as ParsedItem[];

    if (items.length === 0) {
      console.warn(
        "[WWR] Parsed 0 items from RSS feed. Feed format may have changed.",
        {
          url: FEED_URL,
          status: response.status,
          bytes: xml.length,
        },
      );
      return [];
    }

    const records = items
      .map(toSourceRecord)
      .filter((r): r is jobSourceRecord => Boolean(r))
      .filter(shouldInclude);

    if (items.length > 0 && records.length === 0) {
      console.warn(
        "[WWR] 0 records after filtering. Filters may be too strict.",
        {
          url: FEED_URL,
          excludeKeywords,
        },
      );
    }

    const limit = toSafeLimit((query as any).limit, 50);
    return limit ? records.slice(0, limit) : records;
  },
});
