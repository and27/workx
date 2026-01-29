import { jobSource, jobSourceRecord } from "@/src/ports/job-source";

type rssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string | null;
  description: string | null;
  categories: string[];
};

const SOURCE = "WWR";
const FEED_URL = "https://weworkremotely.com/remote-jobs.rss";
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

const decodeCdata = (value: string) =>
  value.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1").trim();

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const extractTag = (block: string, tag: string) => {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return null;
  return decodeCdata(match[1]).trim();
};

const extractTags = (block: string, tag: string) => {
  const matches = Array.from(
    block.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "gi"))
  );
  return matches
    .map((match) => decodeCdata(match[1]).trim())
    .filter(Boolean);
};

const toPublishedAt = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
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

const splitOn = (value: string, delimiter: string) => {
  const index = value.indexOf(delimiter);
  if (index <= 0) return null;
  return [value.slice(0, index), value.slice(index + delimiter.length)];
};

const parseTitle = (title: string) => {
  const cleaned = title.trim();
  if (!cleaned) {
    return { role: "Unknown role", company: "Unknown" };
  }

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
      left.toLowerCase().includes(hint)
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

const toRssItem = (itemXml: string): rssItem | null => {
  const title = extractTag(itemXml, "title");
  const link = extractTag(itemXml, "link");
  if (!title || !link) return null;
  const guid = extractTag(itemXml, "guid") ?? link;
  const pubDate = extractTag(itemXml, "pubDate");
  const description = extractTag(itemXml, "description");
  const categories = extractTags(itemXml, "category");
  return {
    title,
    link,
    guid,
    pubDate,
    description,
    categories,
  };
};

const toSourceRecord = (item: rssItem): jobSourceRecord => {
  const { role, company } = parseTitle(item.title);
  const location = extractLocation(item.description) ?? "Remote";
  const tags = item.categories.length > 0 ? item.categories : [];
  return {
    externalId: item.guid,
    source: SOURCE,
    role,
    company,
    location,
    seniority: normalizeSeniority(item.title),
    tags,
    description: item.description ?? null,
    sourceUrl: item.link,
    publishedAt: toPublishedAt(item.pubDate),
  };
};

export const createWwrJobSource = (): jobSource => ({
  list: async (query = {}) => {
    if (query.source && query.source !== SOURCE) {
      return [];
    }

    const response = await fetch(FEED_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch WWR jobs.");
    }

    const xml = await response.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi))
      .map((match) => toRssItem(match[1]))
      .filter((item): item is rssItem => Boolean(item));

    const records = items.map(toSourceRecord).filter(shouldInclude);
    const limited = query.limit ? records.slice(0, query.limit) : records;
    return limited;
  },
});
