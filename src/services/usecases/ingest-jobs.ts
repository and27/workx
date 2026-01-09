import { jobSource, jobSourceQuery } from "@/src/ports/job-source";
import { ok, result } from "@/src/services/usecases/result";

export type ingestJobsInput = jobSourceQuery;

export type ingestJobsOutput = {
  fetched: number;
  created: number;
  updated: number;
};

export type ingestJobsDeps = {
  jobSource: jobSource;
};

export const createIngestJobsUseCase =
  (dependencies: ingestJobsDeps) =>
  async (input: ingestJobsInput = {}): Promise<result<ingestJobsOutput>> => {
    const jobs = await dependencies.jobSource.list(input);
    return ok({ fetched: jobs.length, created: 0, updated: 0 });
  };
