import { jobRepository, jobUpsertRecord } from "@/src/ports/job-repository";
import { jobSource, jobSourceQuery } from "@/src/ports/job-source";
import { ingestRunRepository } from "@/src/ports/ingest-run-repository";
import { toIsoNow } from "@/src/services/usecases/date-only";
import { err, ok, result } from "@/src/services/usecases/result";
import { getDailyIngestCap, getStartOfTodayIso } from "@/src/services/usecases/ingest-status";

export type ingestJobsWithCapInput = jobSourceQuery;

export type ingestJobsWithCapOutput = {
  fetched: number;
  created: number;
  updated: number;
  used: number;
  limit: number;
  remaining: number;
};

export type ingestJobsWithCapDeps = {
  jobSource: jobSource;
  jobRepository: jobRepository;
  ingestRunRepository: ingestRunRepository;
};

const capReachedMessage = (used: number, limit: number) =>
  `Limite diario alcanzado (${used}/${limit}).`;

export const createIngestJobsWithCapUseCase =
  (dependencies: ingestJobsWithCapDeps) =>
  async (
    input: ingestJobsWithCapInput = {}
  ): Promise<result<ingestJobsWithCapOutput, Error>> => {
    const limit = getDailyIngestCap();
    if (limit <= 0) {
      return err(new Error("Ingesta deshabilitada por limite diario."));
    }

    const since = getStartOfTodayIso();
    const used = await dependencies.ingestRunRepository.count({ since });
    if (used >= limit) {
      return err(new Error(capReachedMessage(used, limit)));
    }

    const now = toIsoNow();
    const source = input.source ?? null;

    try {
      const jobs = await dependencies.jobSource.list(input);
      const upsertRecords: jobUpsertRecord[] = jobs.map((job) => ({
        externalId: job.externalId,
        source: job.source,
        role: job.role,
        company: job.company,
        location: job.location,
        seniority: job.seniority,
        tags: job.tags,
        description: job.description ?? null,
        sourceUrl: job.sourceUrl,
        publishedAt: job.publishedAt,
      }));

      const upserted =
        upsertRecords.length > 0
          ? await dependencies.jobRepository.upsertByExternalId({
              jobs: upsertRecords,
              now,
            })
          : { created: 0, updated: 0 };

      await dependencies.ingestRunRepository.create({
        source,
        status: "success",
        created: upserted.created,
        updated: upserted.updated,
        error: null,
        createdAt: now,
      });

      const usedAfter = await dependencies.ingestRunRepository.count({ since });

      return ok({
        fetched: jobs.length,
        created: upserted.created,
        updated: upserted.updated,
        used: usedAfter,
        limit,
        remaining: Math.max(0, limit - usedAfter),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos ingestar trabajos.";
      await dependencies.ingestRunRepository.create({
        source,
        status: "failed",
        created: 0,
        updated: 0,
        error: message,
        createdAt: now,
      });
      return err(error instanceof Error ? error : new Error(message));
    }
  };

export const isIngestCapError = (error: Error) =>
  error.message.startsWith("Limite diario alcanzado");
