import { application } from "@/src/domain/entities/application";
import { applicationRepository } from "@/src/ports/application-repository";

export type getApplicationInput = {
  id: string;
};

export const createGetApplicationUseCase =
  (dependencies: { applicationRepository: applicationRepository }) =>
  async (input: getApplicationInput): Promise<application | null> => {
    return dependencies.applicationRepository.getById({ id: input.id });
  };
