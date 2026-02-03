import { describe, expect, it } from "vitest";
import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { job } from "@/src/domain/entities/job";
import { applicationLogRepository } from "@/src/ports/application-log-repository";
import { applicationRepository } from "@/src/ports/application-repository";
import { jobRepository } from "@/src/ports/job-repository";
import { addDaysDateOnly } from "@/src/services/usecases/date-only";
import { createApplicationFromJobUseCase } from "@/src/services/usecases/create-application-from-job";

const makeJob = (overrides: Partial<job>): job => ({
  id: "job-1",
  company: "Acme",
  role: "Engineer",
  source: "LinkedIn",
  sourceUrl: null,
  externalId: null,
  location: "Remoto",
  seniority: "Mid",
  tags: ["React"],
  description: null,
  triageStatus: null,
  triageReasons: null,
  triagedAt: null,
  triageProvider: null,
  triageVersion: null,
  rankScore: null,
  rankReason: null,
  rankProvider: null,
  rankVersion: null,
  publishedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("createApplicationFromJob", () => {
  it("sets defaults and creates audit log", async () => {
    const jobs = [makeJob({ id: "job-1" })];
    const applications: application[] = [];
    const logs: applicationLogEntry[] = [];

    const jobRepo: jobRepository = {
      async list() {
        return jobs;
      },
      async getById(query) {
        return jobs.find((job) => job.id === query.id) ?? null;
      },
      async upsertByExternalId() {
        return { created: 0, updated: 0 };
      },
      async updateTriage() {
        throw new Error("Not implemented");
      },
      async updateRank() {
        throw new Error("Not implemented");
      },
    };

    const applicationRepo: applicationRepository = {
      async list() {
        return applications;
      },
      async getById() {
        return null;
      },
      async create(query) {
        applications.push(query.application);
      },
      async update() {
        throw new Error("Not implemented");
      },
    };

    const logRepo: applicationLogRepository = {
      async listByApplicationId() {
        return [];
      },
      async create(query) {
        logs.push(query.entry);
      },
    };

    const usecase = createApplicationFromJobUseCase({
      applicationRepository: applicationRepo,
      applicationLogRepository: logRepo,
      jobRepository: jobRepo,
    });

    const result = await usecase({ jobId: "job-1" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.status).toBe("saved");
    expect(result.value.priority).toBe("medium");
    expect(result.value.nextActionAt).toBe(addDaysDateOnly(new Date(), 1));
    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe("created_from_job");
  });
});
