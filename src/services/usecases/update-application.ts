import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { applicationLogRepository } from "@/src/ports/application-log-repository";
import {
  applicationRepository,
  applicationUpdatePatch,
} from "@/src/ports/application-repository";
import { dateOnly, isDateOnly } from "@/src/domain/types/date-only";
import { applicationStatus } from "@/src/domain/types/application-status";
import { priority } from "@/src/domain/types/priority";
import { toIsoNow } from "@/src/services/usecases/date-only";
import { applicationNotFoundError } from "@/src/services/usecases/errors";
import { err, ok, result } from "@/src/services/usecases/result";

const toHex = (value: number, length: number) =>
  value.toString(16).padStart(length, "0");

const makeId = (seed: number) =>
  `${toHex(seed, 8)}-${toHex(seed, 4)}-${toHex(seed, 4)}-${toHex(
    seed,
    4
  )}-${toHex(seed, 12)}`;

let idCounter = 0;
const createId = () => {
  idCounter += 1;
  return makeId(Math.abs(Date.now() + idCounter));
};

const buildLogEntry = (
  applicationId: string,
  type: applicationLogEntry["type"],
  message: string,
  createdAt: string
): applicationLogEntry => ({
  id: createId(),
  applicationId,
  type,
  message,
  createdAt,
});

export type updateApplicationInput = {
  id: string;
  status?: applicationStatus;
  priority?: priority;
  nextActionAt?: dateOnly | null;
  notes?: string;
};

export type updateApplicationDeps = {
  applicationRepository: applicationRepository;
  applicationLogRepository: applicationLogRepository;
};

export const updateApplicationUseCase =
  (dependencies: updateApplicationDeps) =>
  async (
    input: updateApplicationInput
  ): Promise<result<application, applicationNotFoundError>> => {
    const existing = await dependencies.applicationRepository.getById({
      id: input.id,
    });
    if (!existing) {
      return err(new applicationNotFoundError(input.id));
    }

    const updatedAt = toIsoNow();
    const patch: applicationUpdatePatch = {
      updatedAt,
    };
    const logs: applicationLogEntry[] = [];

    if (input.status && input.status !== existing.status) {
      patch.status = input.status;
      logs.push(
        buildLogEntry(
          existing.id,
          "status_changed",
          `Estado actualizado a ${input.status}.`,
          updatedAt
        )
      );
    }

    if (input.priority && input.priority !== existing.priority) {
      patch.priority = input.priority;
    }

    if (
      typeof input.notes === "string" &&
      input.notes !== existing.notes
    ) {
      patch.notes = input.notes;
      logs.push(
        buildLogEntry(
          existing.id,
          "notes_updated",
          "Notas actualizadas.",
          updatedAt
        )
      );
    }

    if (input.nextActionAt !== undefined) {
      const current = existing.nextActionAt;
      const next = input.nextActionAt;
      if (current !== next) {
        if (next !== null && !isDateOnly(next)) {
          throw new Error(`Invalid date-only value: ${next}`);
        }
        patch.nextActionAt = next ?? null;
        logs.push(
          buildLogEntry(
            existing.id,
            next ? "next_action_set" : "next_action_cleared",
            next
              ? `Accion siguiente programada para ${next}.`
              : "Accion siguiente eliminada.",
            updatedAt
          )
        );
      }
    }

    const updated = await dependencies.applicationRepository.update({
      id: existing.id,
      patch,
    });

    for (const entry of logs) {
      await dependencies.applicationLogRepository.create({ entry });
    }

    return ok(updated);
  };
