import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";
import { jobTriageDecision, jobTriagePort } from "@/src/ports/job-triage";

type triagePayload = {
  decision?: string;
  status?: string;
  reasons?: unknown;
};

const trimText = (value: string, maxLength = 2000) =>
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

const parseDecision = (value: string | undefined | null): triageStatus | null => {
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

const extractJson = (text: string): triagePayload | null => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as triagePayload;
  } catch {
    return null;
  }
};

const toDecision = (
  payload: triagePayload | null,
  provider: triageProvider
): jobTriageDecision | null => {
  if (!payload) return null;
  const decision = parseDecision(payload.decision ?? payload.status);
  if (!decision) return null;
  const reasons = normalizeReasons(payload.reasons);
  return {
    status: decision,
    reasons,
    provider,
  };
};

const buildCoarsePrompt = (jobRecord: job, profile: userProfile) => `You are a job triage assistant.
Return JSON only in the form:
{"decision":"shortlist|maybe|reject","reasons":["reason 1","reason 2"]}

User profile:
${buildProfileText(profile)}

Job:
${buildJobText(jobRecord)}
`;

const buildDisambiguationPrompt = (
  jobRecord: job,
  profile: userProfile,
  previous: jobTriageDecision
) => `You are a job triage assistant.
Return JSON only in the form:
{"decision":"shortlist|maybe|reject","reasons":["reason 1","reason 2"]}

Previous decision: ${previous.status}

User profile:
${buildProfileText(profile)}

Job:
${buildJobText(jobRecord)}
`;

const fetchOllama = async (
  jobRecord: job,
  profile: userProfile
): Promise<jobTriageDecision | null> => {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim() ?? "";
  const model = process.env.OLLAMA_MODEL?.trim() ?? "";
  if (!baseUrl || !model) {
    return null;
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: buildCoarsePrompt(jobRecord, profile),
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { response?: string };
    const payload = data.response ? extractJson(data.response) : null;
    return toDecision(payload, "ollama");
  } catch {
    return null;
  }
};

const fetchOpenAI = async (
  jobRecord: job,
  profile: userProfile,
  previous: jobTriageDecision
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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: { content?: { text?: string }[] }[];
    };
    const text =
      data.output_text ??
      data.output?.[0]?.content?.[0]?.text ??
      "";
    const payload = text ? extractJson(text) : null;
    return toDecision(payload, "openai");
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

