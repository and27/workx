import { job } from "@/src/domain/entities/job";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";

export type listJobsInput = listJobsQuery;

export const createListJobsUseCase =
  (dependencies: { jobRepository: jobRepository }) =>
  async (input: listJobsInput = {}): Promise<job[]> => {
    const items = await dependencies.jobRepository.list(input);
    return [...items].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    );
  };
