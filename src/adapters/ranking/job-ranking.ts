import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { jobRankDecision, jobRankPort } from "@/src/ports/job-ranking";

type rankPayload = {
  score?: unknown;
  reason?: unknown;
};

const trimText = (value: string, maxLength = 1400) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const buildProfileText = (profile: userProfile) => {
  const parts = [
    `must_have: ${profile.mustHaveKeywords.join(", ")}`,
    `hard_no: ${profile.hardNoKeywords.join(", ")}`,
    `preferred: ${profile.preferredKeywords.join(", ")}`,
    `excluded: ${profile.excludedKeywords.join(", ")}`,
  ];
  if (profile.notes) {
    parts.push(`notes: ${profile.notes}`);
  }
  return parts.join("\n");
};

const buildJobText = (jobRecord: job) => {
  const description = jobRecord.description
    ? trimText(jobRecord.description)
    : "none";
  return [
    `role: ${jobRecord.role}`,
    `company: ${jobRecord.company}`,
    `location: ${jobRecord.location}`,
    `seniority: ${jobRecord.seniority}`,
    `tags: ${jobRecord.tags.join(", ")}`,
    `description: ${description}`,
  ].join("\n");
};

const normalizeScore = (value: unknown): number | null => {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const normalizeReason = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const extractJson = (text: string): unknown | null => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as unknown;
  } catch {
    return null;
  }
};

const parseJsonText = (text: string): unknown | null => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return extractJson(text);
  }
};

const toDecision = (
  payload: rankPayload | null,
  provider: triageProvider
): jobRankDecision | null => {
  if (!payload) return null;
  const score = normalizeScore(payload.score);
  const reason = normalizeReason(payload.reason);
  if (score === null || reason.length === 0) return null;
  return { score, reason, provider };
};

const buildRankPrompt = (jobRecord: job, profile: userProfile) => `You are a job ranking assistant.
Return JSON only in the form:
{"score":0,"reason":"short explanation"}

Score range: 0-100 where 100 is an outstanding fit. Reason should be concise.

User profile:
${buildProfileText(profile)}

Job:
${buildJobText(jobRecord)}
`;

const fetchOllama = async (
  jobRecord: job,
  profile: userProfile
): Promise<jobRankDecision | null> => {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim() ?? "";
  const model = process.env.OLLAMA_MODEL?.trim() ?? "";
  if (!baseUrl || !model) {
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: buildRankPrompt(jobRecord, profile),
        stream: false,
      }),
    });
  } catch {
    throw new Error("Ollama no está disponible.");
  }

  if (!response.ok) {
    throw new Error("Ollama no está disponible.");
  }

  const data = (await response.json().catch(() => null)) as
    | { response?: string }
    | null;
  if (!data?.response) return null;

  const payload = parseJsonText(data.response) as rankPayload | null;
  return toDecision(payload, "ollama");
};

const fetchOpenAI = async (
  jobRecord: job,
  profile: userProfile
): Promise<jobRankDecision | null> => {
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const model = process.env.OPENAI_MODEL?.trim() ?? "";
  if (!apiKey || !model) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildRankPrompt(jobRecord, profile),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_rank",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                score: { type: "number", minimum: 0, maximum: 100 },
                reason: { type: "string" },
              },
              required: ["score", "reason"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: { content?: { text?: string }[] }[];
    };
    const text = data.output_text ?? data.output?.[0]?.content?.[0]?.text ?? "";
    const payload = text
      ? (parseJsonText(text) as rankPayload | null)
      : null;
    return toDecision(payload, "openai");
  } catch {
    return null;
  }
};

export const createJobRankingAdapter = (): jobRankPort => ({
  rank: async ({ job: jobRecord, profile, provider }) => {
    if (provider === "openai") {
      return fetchOpenAI(jobRecord, profile);
    }
    return fetchOllama(jobRecord, profile);
  },
});
