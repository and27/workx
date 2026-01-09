import { application } from "@/src/domain/entities/application";
import {
  applicationRepository,
  listApplicationsQuery,
} from "@/src/ports/application-repository";

export type listApplicationsInput = listApplicationsQuery;

export const createListApplicationsUseCase =
  (dependencies: { applicationRepository: applicationRepository }) =>
  async (input: listApplicationsInput = {}): Promise<application[]> => {
    const items = await dependencies.applicationRepository.list(input);
    return [...items].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    );
  };
