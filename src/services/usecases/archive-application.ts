import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { applicationLogRepository } from "@/src/ports/application-log-repository";
import {
  applicationRepository,
  applicationUpdatePatch,
} from "@/src/ports/application-repository";
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
  message: string,
  createdAt: string
): applicationLogEntry => ({
  id: createId(),
  applicationId,
  type: "status_changed",
  message,
  createdAt,
});

export type archiveApplicationInput = {
  id: string;
};

export type archiveApplicationDeps = {
  applicationRepository: applicationRepository;
  applicationLogRepository: applicationLogRepository;
};

export const createArchiveApplicationUseCase =
  (dependencies: archiveApplicationDeps) =>
  async (
    input: archiveApplicationInput
  ): Promise<result<application, applicationNotFoundError>> => {
    const existing = await dependencies.applicationRepository.getById({
      id: input.id,
    });
    if (!existing) {
      return err(new applicationNotFoundError(input.id));
    }

    if (existing.status === "archived" && existing.nextActionAt === null) {
      return ok(existing);
    }

    const updatedAt = toIsoNow();
    const patch: applicationUpdatePatch = {
      status: "archived",
      nextActionAt: null,
      updatedAt,
    };

    const updated = await dependencies.applicationRepository.update({
      id: existing.id,
      patch,
    });

    await dependencies.applicationLogRepository.create({
      entry: buildLogEntry(existing.id, "Postulacion archivada.", updatedAt),
    });

    return ok(updated);
  };
