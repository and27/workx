import { jobRepository } from "@/src/ports/job-repository";

export const createListJobSourcesUseCase =
  (dependencies: { jobRepository: jobRepository }) =>
  async (): Promise<string[]> => dependencies.jobRepository.listSources();
