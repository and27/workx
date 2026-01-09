import { describe, expect, it } from "vitest";
import { application } from "@/src/domain/entities/application";
import { applicationRepository } from "@/src/ports/application-repository";
import {
  addDaysDateOnly,
  todayDateOnly,
  toIsoNow,
} from "@/src/services/usecases/date-only";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";

const makeApplication = (overrides: Partial<application>): application => {
  const now = toIsoNow();
  return {
    id: "app-1",
    company: "Acme",
    role: "Engineer",
    status: "saved",
    priority: "medium",
    nextActionAt: todayDateOnly(),
    source: "LinkedIn",
    notes: "",
    createdAt: now,
    updatedAt: now,
    jobId: null,
    ...overrides,
  };
};

const createRepository = (items: application[]): applicationRepository => ({
  async list() {
    return items;
  },
  async getById() {
    return null;
  },
  async create() {},
  async update() {
    throw new Error("Not implemented");
  },
});

describe("listInbox", () => {
  it("groups by date-only semantics", async () => {
    const base = new Date();
    const items = [
      makeApplication({
        id: "overdue",
        nextActionAt: addDaysDateOnly(base, -1),
      }),
      makeApplication({
        id: "today",
        nextActionAt: todayDateOnly(),
      }),
      makeApplication({
        id: "upcoming",
        nextActionAt: addDaysDateOnly(base, 2),
      }),
      makeApplication({
        id: "none",
        nextActionAt: null,
      }),
    ];

    const usecase = createListInboxUseCase({
      applicationRepository: createRepository(items),
    });
    const result = await usecase();

    expect(result.overdue.map((item) => item.id)).toEqual(["overdue"]);
    expect(result.today.map((item) => item.id)).toEqual(["today"]);
    expect(result.upcoming.map((item) => item.id)).toEqual(["upcoming"]);
  });
});
