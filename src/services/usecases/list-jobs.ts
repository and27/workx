import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";

export type listJobsInput = listJobsQuery & {
  needsRetriage?: boolean;
};

const triageRank = (value: job["triageStatus"]) => {
  if (value === "shortlist") return 0;
  if (value === "maybe") return 1;
  if (value === "reject") return 2;
  return 3;
};

const getNeedsRetriage = (jobRecord: job, profileVersion: number) =>
  jobRecord.triageStatus !== null &&
  jobRecord.triageVersion !== profileVersion;

export const createListJobsUseCase =
  (dependencies: { jobRepository: jobRepository; profile: userProfile }) =>
  async (input: listJobsInput = {}): Promise<job[]> => {
    const { needsRetriage, ...repoQuery } = input;
    const items = await dependencies.jobRepository.list(repoQuery);
    const profileVersion = dependencies.profile.profileVersion;
    const decorated = items.map((jobRecord) => ({
      ...jobRecord,
      needsRetriage: getNeedsRetriage(jobRecord, profileVersion),
    }));
    const filtered =
      typeof needsRetriage === "boolean"
        ? decorated.filter(
            (jobRecord) => jobRecord.needsRetriage === needsRetriage
          )
        : decorated;

    return [...filtered].sort((left, right) =>
      triageRank(left.triageStatus) === triageRank(right.triageStatus)
        ? right.updatedAt.localeCompare(left.updatedAt)
        : triageRank(left.triageStatus) - triageRank(right.triageStatus)
    );
  };
