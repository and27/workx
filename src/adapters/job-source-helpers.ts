export const normalizeSeniority = (title: string) => {
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

export const toTags = (value: unknown): string[] => {
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

export const toPublishedAt = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};
