import { job } from "@/src/domain/entities/job";
import {
  listJobsDeps,
  listJobsInput,
  prepareJobs,
} from "@/src/services/usecases/list-jobs";

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

export const createListJobsPageUseCase =
  (dependencies: listJobsDeps) =>
  async (input: listJobsPageInput = {}): Promise<listJobsPageOutput> => {
    const pageSize = normalizePageSize(input.pageSize);
    const requestedPage = normalizePage(input.page);
    const items = await prepareJobs(dependencies, input);
    const sortedItems =
      input.sort === "publishedAt"
        ? [...items].sort((left, right) => {
            const leftDate = getSortDate(left);
            const rightDate = getSortDate(right);
            if (!leftDate && !rightDate) return 0;
            if (!leftDate) return 1;
            if (!rightDate) return -1;
            return input.order === "asc"
              ? leftDate.localeCompare(rightDate)
              : rightDate.localeCompare(leftDate);
          })
        : items;
    const total = sortedItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(requestedPage, 1), totalPages);
    const offset = (page - 1) * pageSize;
    const pagedItems = sortedItems.slice(offset, offset + pageSize);

    return {
      items: pagedItems,
      total,
      page,
      pageSize,
    };
  };
