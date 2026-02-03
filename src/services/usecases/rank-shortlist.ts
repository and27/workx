import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { jobRankPort } from "@/src/ports/job-ranking";
import { jobRepository } from "@/src/ports/job-repository";
import { err, ok, result } from "@/src/services/usecases/result";

export type rankShortlistInput = {
  limit?: number;
};

export type rankShortlistOutput = {
  processed: number;
  ranked: number;
  skipped: number;
  provider: triageProvider;
};

export type rankShortlistDeps = {
  jobRepository: jobRepository;
  jobRanker: jobRankPort;
  profile: userProfile;
};

const hasOpenAiConfig = () =>
  Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim());

const hasOllamaConfig = () =>
  Boolean(process.env.OLLAMA_BASE_URL?.trim() && process.env.OLLAMA_MODEL?.trim());

const toProvider = (): triageProvider | null => {
  const raw = process.env.RANK_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "ollama") return "ollama";
  if (raw === "openai") return "openai";
  return null;
};

const shouldRank = (
  jobRecord: job,
  provider: triageProvider,
  profileVersion: number
) => {
  if (!jobRecord.description?.trim()) return false;
  if (jobRecord.rankScore === null) return true;
  if (jobRecord.rankProvider !== provider) return true;
  if (jobRecord.rankVersion !== profileVersion) return true;
  return false;
};

export const createRankShortlistUseCase =
  (dependencies: rankShortlistDeps) =>
  async (
    input: rankShortlistInput = {}
  ): Promise<result<rankShortlistOutput, Error>> => {
    const provider = toProvider();
    if (!provider) {
      return err(
        new Error("Configura RANK_PROVIDER con 'ollama' o 'openai'.")
      );
    }
    if (provider === "openai" && !hasOpenAiConfig()) {
      return err(new Error("Configura OpenAI para ranking."));
    }
    if (provider === "ollama" && !hasOllamaConfig()) {
      return err(new Error("Configura Ollama para ranking."));
    }

    const items = await dependencies.jobRepository.list({
      triageStatus: "shortlist",
    });
    const limit =
      typeof input.limit === "number" && Number.isFinite(input.limit)
        ? Math.max(0, Math.floor(input.limit))
        : undefined;
    const candidates = limit !== undefined ? items.slice(0, limit) : items;

    let ranked = 0;
    let skipped = 0;

    for (const jobRecord of candidates) {
      if (!shouldRank(jobRecord, provider, dependencies.profile.profileVersion)) {
        skipped += 1;
        continue;
      }

      const decision = await dependencies.jobRanker.rank({
        job: jobRecord,
        profile: dependencies.profile,
        provider,
      });
      if (!decision) {
        skipped += 1;
        continue;
      }

      await dependencies.jobRepository.updateRank({
        id: jobRecord.id,
        patch: {
          rankScore: decision.score,
          rankReason: decision.reason,
          rankProvider: decision.provider,
          rankVersion: dependencies.profile.profileVersion,
        },
      });
      ranked += 1;
    }

    return ok({
      processed: candidates.length,
      ranked,
      skipped,
      provider,
    });
  };
