import { job } from "@/src/domain/entities/job";
import { jobRepository } from "@/src/ports/job-repository";

export type getJobInput = {
  id: string;
};

export const createGetJobUseCase =
  (dependencies: { jobRepository: jobRepository }) =>
  async (input: getJobInput): Promise<job | null> =>
    dependencies.jobRepository.getById({ id: input.id });
