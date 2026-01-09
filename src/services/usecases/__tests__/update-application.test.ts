import { describe, expect, it } from "vitest";
import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { applicationLogRepository } from "@/src/ports/application-log-repository";
import {
  applicationRepository,
  applicationUpdatePatch,
} from "@/src/ports/application-repository";
import { todayDateOnly } from "@/src/services/usecases/date-only";
import { updateApplicationUseCase } from "@/src/services/usecases/update-application";

const makeApplication = (overrides: Partial<application>): application => {
  const now = new Date().toISOString();
  return {
    id: "app-1",
    company: "Acme",
    role: "Engineer",
    status: "saved",
    priority: "medium",
    nextActionAt: todayDateOnly(),
    source: "LinkedIn",
    notes: "Notas previas.",
    createdAt: now,
    updatedAt: now,
    jobId: null,
    ...overrides,
  };
};

describe("updateApplication", () => {
  it("appends audit log entries for status, notes, and next action changes", async () => {
    const applications: application[] = [makeApplication({})];
    const logs: applicationLogEntry[] = [];

    const applicationRepo: applicationRepository = {
      async list() {
        return applications;
      },
      async getById(query) {
        return applications.find((item) => item.id === query.id) ?? null;
      },
      async create() {
        throw new Error("Not implemented");
      },
      async update(query: { id: string; patch: applicationUpdatePatch }) {
        const index = applications.findIndex((item) => item.id === query.id);
        if (index < 0) {
          throw new Error("Not found");
        }
        const updated = { ...applications[index], ...query.patch };
        applications[index] = updated;
        return updated;
      },
    };

    const logRepo: applicationLogRepository = {
      async listByApplicationId() {
        return logs;
      },
      async create(query) {
        logs.push(query.entry);
      },
    };

    const usecase = updateApplicationUseCase({
      applicationRepository: applicationRepo,
      applicationLogRepository: logRepo,
    });

    const result = await usecase({
      id: "app-1",
      status: "applied",
      notes: "Notas nuevas.",
      nextActionAt: null,
    });

    expect(result.ok).toBe(true);
    expect(logs).toHaveLength(3);
    expect(logs.map((entry) => entry.type).sort()).toEqual(
      ["next_action_cleared", "notes_updated", "status_changed"].sort()
    );
  });
});
