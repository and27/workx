import { jobRepository, jobUpsertRecord } from "@/src/ports/job-repository";
import { jobSource, jobSourceQuery } from "@/src/ports/job-source";
import { toIsoNow } from "@/src/services/usecases/date-only";
import { ok, result } from "@/src/services/usecases/result";

export type ingestJobsInput = jobSourceQuery;

export type ingestJobsOutput = {
  fetched: number;
  created: number;
  updated: number;
};

export type ingestJobsDeps = {
  jobSource: jobSource;
  jobRepository: jobRepository;
};

export const createIngestJobsUseCase =
  (dependencies: ingestJobsDeps) =>
  async (
    input: ingestJobsInput = {}
  ): Promise<result<ingestJobsOutput, Error>> => {
    const jobs = await dependencies.jobSource.list(input);
    if (jobs.length === 0) {
      return ok({ fetched: 0, created: 0, updated: 0 });
    }

    const now = toIsoNow();
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

    const upserted = await dependencies.jobRepository.upsertByExternalId({
      jobs: upsertRecords,
      now,
    });

    return ok({
      fetched: jobs.length,
      created: upserted.created,
      updated: upserted.updated,
    });
  };
