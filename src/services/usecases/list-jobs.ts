import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { jobRepository, listJobsQuery } from "@/src/ports/job-repository";

export type listJobsInput = listJobsQuery & {
  needsRetriage?: boolean;
};

export type listJobsDeps = {
  jobRepository: jobRepository;
  profile: userProfile;
};

type listJobsPrepareInput = listJobsInput & {
  page?: number;
  pageSize?: number;
};

const triageRank = (value: job["triageStatus"]) => {
  if (value === "shortlist") return 0;
  if (value === "maybe") return 1;
  if (value === "reject") return 2;
  return 3;
};

const toRankScore = (value: job["rankScore"]) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const getNeedsRetriage = (jobRecord: job, profileVersion: number) =>
  jobRecord.triageStatus !== null &&
  jobRecord.triageVersion !== profileVersion;

export const prepareJobs = async (
  dependencies: listJobsDeps,
  input: listJobsPrepareInput = {}
): Promise<job[]> => {
  const { needsRetriage, page, pageSize, ...repoQuery } = input;
  const items = await dependencies.jobRepository.list(repoQuery);
  const profileVersion = dependencies.profile.profileVersion;
  const decorated = items.map((jobRecord) => ({
    ...jobRecord,
    needsRetriage: getNeedsRetriage(jobRecord, profileVersion),
  }));
  const filtered =
    typeof needsRetriage === "boolean"
      ? decorated.filter((jobRecord) => jobRecord.needsRetriage === needsRetriage)
      : decorated;

  return [...filtered].sort((left, right) => {
    const leftRank = triageRank(left.triageStatus);
    const rightRank = triageRank(right.triageStatus);
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    if (leftRank === 0) {
      const leftScore = toRankScore(left.rankScore);
      const rightScore = toRankScore(right.rankScore);
      if (leftScore !== null || rightScore !== null) {
        if (leftScore === null) return 1;
        if (rightScore === null) return -1;
        if (leftScore !== rightScore) return rightScore - leftScore;
      }
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
};

export const createListJobsUseCase =
  (dependencies: listJobsDeps) =>
  async (input: listJobsInput = {}): Promise<job[]> =>
    prepareJobs(dependencies, input);
