import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { jobRepository } from "@/src/ports/job-repository";
import { jobTriagePort } from "@/src/ports/job-triage";
import { toIsoNow } from "@/src/services/usecases/date-only";
import { err, ok, result } from "@/src/services/usecases/result";

export type triageJobsInput = {
  mode?: "new" | "recent";
  days?: number;
};

export type triageJobsOutput = {
  mode: "new" | "recent";
  days: number;
  processed: number;
  triaged: number;
  skipped: number;
  openaiUsed: number;
  openaiSkippedCap: number;
};

export type triageJobsDeps = {
  jobRepository: jobRepository;
  jobTriage: jobTriagePort;
  profile: userProfile;
};

type openAiUsageState = {
  dateKey: string;
  used: number;
};

const openAiUsage: openAiUsageState = { dateKey: "", used: 0 };

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getOpenAiDailyCap = () => {
  const raw = process.env.OPENAI_DAILY_CAP?.trim();
  const parsed = raw ? Number(raw) : 10;
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const getOpenAiUsage = () => {
  const today = toDateKey();
  if (openAiUsage.dateKey !== today) {
    openAiUsage.dateKey = today;
    openAiUsage.used = 0;
  }
  return openAiUsage;
};

const hasOpenAiConfig = () =>
  Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim());

const isRecent = (jobRecord: job, days: number) => {
  const reference =
    jobRecord.publishedAt ?? jobRecord.createdAt ?? jobRecord.updatedAt;
  const parsed = new Date(reference);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return parsed >= cutoff;
};

const nowIso = (): isoDateTime => toIsoNow();

export const createTriageJobsUseCase =
  (dependencies: triageJobsDeps) =>
  async (
    input: triageJobsInput = {}
  ): Promise<result<triageJobsOutput, Error>> => {
    const mode = input.mode === "recent" ? "recent" : "new";
    const days = input.days && input.days > 0 ? input.days : 14;

    const items =
      mode === "new"
        ? await dependencies.jobRepository.list({ triageStatus: "untriaged" })
        : await dependencies.jobRepository.list({});

    const candidates =
      mode === "recent"
        ? items.filter((jobRecord) => isRecent(jobRecord, days))
        : items;

    let triaged = 0;
    let skipped = 0;
    let openaiUsed = 0;
    let openaiSkippedCap = 0;
    const openAiCap = getOpenAiDailyCap();
    const openAiEnabled = hasOpenAiConfig();

    for (const jobRecord of candidates) {
      const coarse = await dependencies.jobTriage.coarse({
        job: jobRecord,
        profile: dependencies.profile,
      });
      if (!coarse) {
        skipped += 1;
        continue;
      }

      let finalDecision = coarse;
      if (coarse.status === "maybe") {
        if (!openAiEnabled) {
          // OpenAI not configured; keep coarse decision.
        } else if (openAiCap <= 0) {
          openaiSkippedCap += 1;
        } else {
          const usage = getOpenAiUsage();
          if (usage.used >= openAiCap) {
            openaiSkippedCap += 1;
          } else {
            usage.used += 1;
            openaiUsed += 1;
            const disambiguated = await dependencies.jobTriage.disambiguate({
              job: jobRecord,
              profile: dependencies.profile,
              previous: coarse,
            });
            if (disambiguated) {
              finalDecision = disambiguated;
            }
          }
        }
      }

      const triagedAt = nowIso();
      try {
        await dependencies.jobRepository.updateTriage({
          id: jobRecord.id,
          patch: {
            triageStatus: finalDecision.status,
            triageReasons: finalDecision.reasons,
            triagedAt,
            triageProvider: finalDecision.provider,
          },
        });
        triaged += 1;
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Triage failed."));
      }
    }

    return ok({
      mode,
      days,
      processed: candidates.length,
      triaged,
      skipped,
      openaiUsed,
      openaiSkippedCap,
    });
  };
