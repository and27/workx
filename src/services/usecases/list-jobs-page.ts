import { job } from "@/src/domain/entities/job";
import { listJobsDeps, listJobsInput } from "@/src/services/usecases/list-jobs";

export type listJobsPageInput = listJobsInput & {
  page?: number;
  pageSize?: number;
  sort?: "publishedAt";
  order?: "asc" | "desc";
};

export type listJobsPageOutput = {
  items: job[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 25;

const normalizePage = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 1;

const normalizePageSize = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : DEFAULT_PAGE_SIZE;

const getSortDate = (record: job) => record.publishedAt ?? null;

const getNeedsRetriage = (jobRecord: job, profileVersion: number) =>
  jobRecord.triageStatus !== null &&
  jobRecord.triageVersion !== profileVersion;

const triageRank = (value: job["triageStatus"]) => {
  if (value === "shortlist") return 0;
  if (value === "maybe") return 1;
  if (value === "reject") return 2;
  return 3;
};

const toRankScore = (value: job["rankScore"]) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toRecency = (record: job) =>
  record.publishedAt ?? record.updatedAt;

export const createListJobsPageUseCase =
  (dependencies: listJobsDeps) =>
  async (input: listJobsPageInput = {}): Promise<listJobsPageOutput> => {
    const pageSize = normalizePageSize(input.pageSize);
    const requestedPage = normalizePage(input.page);
    const { needsRetriage, pageSize: _, ...repoQuery } = input;

    if (typeof needsRetriage === "boolean") {
      const items = await dependencies.jobRepository.list(repoQuery);
      const profileVersion = dependencies.profile.profileVersion;
      const decorated = items.map((jobRecord) => ({
        ...jobRecord,
        needsRetriage: getNeedsRetriage(jobRecord, profileVersion),
      }));
      const filtered = decorated.filter(
        (jobRecord) => jobRecord.needsRetriage === needsRetriage
      );
      const sortedItems =
        input.sort === "publishedAt"
          ? [...filtered].sort((left, right) => {
              const leftDate = getSortDate(left);
              const rightDate = getSortDate(right);
              if (!leftDate && !rightDate) return 0;
              if (!leftDate) return 1;
              if (!rightDate) return -1;
              return input.order === "asc"
                ? leftDate.localeCompare(rightDate)
                : rightDate.localeCompare(leftDate);
            })
          : [...filtered].sort((left, right) => {
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
                const leftRecency = toRecency(left);
                const rightRecency = toRecency(right);
                if (leftRecency !== rightRecency) {
                  return rightRecency.localeCompare(leftRecency);
                }
              }
              return right.updatedAt.localeCompare(left.updatedAt);
            });
      const total = sortedItems.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const finalPage = Math.min(Math.max(requestedPage, 1), totalPages);
      const offset = (finalPage - 1) * pageSize;
      const pagedItems = sortedItems.slice(offset, offset + pageSize);

      return {
        items: pagedItems,
        total,
        page: finalPage,
        pageSize,
      };
    }

    const orderBy =
      input.sort === "publishedAt"
        ? "publishedAt"
        : input.triageStatus === "shortlist" || input.triageStatus === undefined
          ? "rankScore"
          : "updatedAt";
    const order =
      orderBy === "publishedAt" && input.order === "asc" ? "asc" : "desc";
    let page = Math.max(requestedPage, 1);
    let offset = (page - 1) * pageSize;
    let pageResult = await dependencies.jobRepository.listPage({
      ...repoQuery,
      limit: pageSize,
      offset,
      orderBy,
      order,
    });
    let totalPages = Math.max(1, Math.ceil(pageResult.total / pageSize));
    if (page > totalPages) {
      page = totalPages;
      offset = (page - 1) * pageSize;
      pageResult = await dependencies.jobRepository.listPage({
        ...repoQuery,
        limit: pageSize,
        offset,
        orderBy,
        order,
      });
      totalPages = Math.max(1, Math.ceil(pageResult.total / pageSize));
    }

    const profileVersion = dependencies.profile.profileVersion;
    const decorated = pageResult.items.map((jobRecord) => ({
      ...jobRecord,
      needsRetriage: getNeedsRetriage(jobRecord, profileVersion),
    }));

    return {
      items: decorated,
      total: pageResult.total,
      page,
      pageSize,
    };
  };
