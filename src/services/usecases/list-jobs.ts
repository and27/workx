import { job } from "@/src/domain/entities/job";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";

export type listJobsInput = listJobsQuery;

const triageRank = (value: job["triageStatus"]) => {
  if (value === "shortlist") return 0;
  if (value === "maybe") return 1;
  if (value === "reject") return 2;
  return 3;
};

export const createListJobsUseCase =
  (dependencies: { jobRepository: jobRepository }) =>
  async (input: listJobsInput = {}): Promise<job[]> => {
    const items = await dependencies.jobRepository.list(input);
    return [...items].sort((left, right) =>
      triageRank(left.triageStatus) === triageRank(right.triageStatus)
        ? right.updatedAt.localeCompare(left.updatedAt)
        : triageRank(left.triageStatus) - triageRank(right.triageStatus)
    );
  };
