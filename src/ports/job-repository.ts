import { job } from "@/src/domain/entities/job";

export type listJobsQuery = {
  search?: string;
  seniority?: string;
  source?: string;
  tags?: string[];
};

export interface jobRepository {
  list(query: listJobsQuery): Promise<job[]>;
  getById(query: { id: string }): Promise<job | null>;
}
