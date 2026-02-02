import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";
import { jobTriageDecision, jobTriagePort } from "@/src/ports/job-triage";

type triagePayload = {
  decision?: string;
  status?: string;
  reasons?: unknown;
  confidence?: unknown;
  tags?: unknown;
};

type openAiPayload = {
  finalDecision?: string;
  fitScore?: unknown;
  reasons?: unknown;
  dealbreakers?: unknown;
  matchedSkills?: unknown;
  missingSkills?: unknown;
  recommendedNextAction?: unknown;
};

const trimText = (value: string, maxLength = 1200) =>
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

const parseDecision = (
  value: string | undefined | null,
): triageStatus | null => {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === "shortlist") return "shortlist";
  if (normalized === "maybe") return "maybe";
  if (normalized === "reject") return "reject";
  return null;
};

const normalizeReasons = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  return [];
};

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  return [];
};

const normalizeConfidence = (value: unknown): number | null => {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  return Math.min(1, Math.max(0, numeric));
};

const normalizeFitScore = (value: unknown): number | null => {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  return Math.min(100, Math.max(0, numeric));
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
  payload: triagePayload | null,
  provider: triageProvider,
): jobTriageDecision | null => {
  if (!payload) return null;
  const decision = parseDecision(payload.decision ?? payload.status);
  if (!decision) return null;
  const confidence = normalizeConfidence(payload.confidence);
  const reasons = normalizeReasons(payload.reasons);
  const tags = normalizeTags(payload.tags);
  const status =
    provider === "ollama" && (confidence === null || confidence < 0.75)
      ? "maybe"
      : decision;
  return {
    status,
    reasons,
    provider,
    confidence,
    tags,
  };
};

const toOpenAiDecision = (
  payload: openAiPayload | null,
): jobTriageDecision | null => {
  if (!payload) return null;
  const decision = parseDecision(payload.finalDecision);
  if (!decision) return null;
  const fitScore = normalizeFitScore(payload.fitScore);
  const reasons = normalizeReasons(payload.reasons);
  const dealbreakers = normalizeReasons(payload.dealbreakers);
  const matchedSkills = normalizeReasons(payload.matchedSkills);
  const missingSkills = normalizeReasons(payload.missingSkills);
  const recommendedNextAction =
    typeof payload.recommendedNextAction === "string"
      ? payload.recommendedNextAction.trim()
      : "";

  const combinedReasons = [
    ...reasons,
    ...dealbreakers.map((reason) => `Dealbreaker: ${reason}`),
    ...missingSkills.map((skill) => `Skill faltante: ${skill}`),
    ...matchedSkills.map((skill) => `Skill match: ${skill}`),
  ].filter(Boolean);

  if (recommendedNextAction) {
    combinedReasons.push(`Next action: ${recommendedNextAction}`);
  }

  return {
    status: decision,
    reasons: combinedReasons.length > 0 ? combinedReasons : reasons,
    provider: "openai",
    confidence: fitScore !== null ? fitScore / 100 : null,
    tags: matchedSkills,
  };
};

const buildCoarsePrompt = (
  jobRecord: job,
  profile: userProfile,
) => `You are a job triage assistant.
Return JSON only in the form:
{"decision":"shortlist|maybe|reject","confidence":0.0,"reasons":["reason 1","reason 2"],"tags":["tag 1","tag 2"]}

User profile:
${buildProfileText(profile)}

Job:
${buildJobText(jobRecord)}
`;

const buildDisambiguationPrompt = (
  jobRecord: job,
  profile: userProfile,
  previous: jobTriageDecision,
) => `You are a job triage assistant.
Return JSON only in the form:
{"finalDecision":"shortlist|maybe|reject","fitScore":0,"reasons":["reason 1","reason 2"],"dealbreakers":["dealbreaker 1"],"matchedSkills":["skill 1"],"missingSkills":["skill 1"],"recommendedNextAction":"short suggestion"}

Previous decision: ${previous.status}

User profile:
${buildProfileText(profile)}

Job:
${buildJobText(jobRecord)}
`;

const fetchOllama = async (
  jobRecord: job,
  profile: userProfile,
): Promise<jobTriageDecision | null> => {
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
        prompt: buildCoarsePrompt(jobRecord, profile),
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

  const payload = parseJsonText(data.response) as triagePayload | null;
  return toDecision(payload, "ollama");
};

const fetchOpenAI = async (
  jobRecord: job,
  profile: userProfile,
  previous: jobTriageDecision,
): Promise<jobTriageDecision | null> => {
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
        input: buildDisambiguationPrompt(jobRecord, profile, previous),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_triage_disambiguation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                finalDecision: {
                  type: "string",
                  enum: ["shortlist", "maybe", "reject"],
                },
                fitScore: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                reasons: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                },
                dealbreakers: {
                  type: "array",
                  items: { type: "string" },
                },
                matchedSkills: {
                  type: "array",
                  items: { type: "string" },
                },
                missingSkills: {
                  type: "array",
                  items: { type: "string" },
                },
                recommendedNextAction: {
                  type: "string",
                },
              },
              required: [
                "finalDecision",
                "fitScore",
                "reasons",
                "dealbreakers",
                "matchedSkills",
                "missingSkills",
                "recommendedNextAction",
              ],
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
      ? (parseJsonText(text) as openAiPayload | null)
      : null;
    return toOpenAiDecision(payload);
  } catch {
    return null;
  }
};

export const createJobTriageAdapter = (): jobTriagePort => ({
  coarse: async ({ job: jobRecord, profile }) =>
    fetchOllama(jobRecord, profile),
  disambiguate: async ({ job: jobRecord, profile, previous }) =>
    fetchOpenAI(jobRecord, profile, previous),
});
