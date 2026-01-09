import { application } from "@/src/domain/entities/application";
import { applicationLogEntry } from "@/src/domain/entities/application-log-entry";
import { applicationLogRepository } from "@/src/ports/application-log-repository";
import { applicationRepository } from "@/src/ports/application-repository";
import { jobRepository } from "@/src/ports/job-repository";
import {
  addDaysDateOnly,
  toIsoNow,
} from "@/src/services/usecases/date-only";
import { jobNotFoundError } from "@/src/services/usecases/errors";
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

export type createApplicationFromJobInput = {
  jobId: string;
};

export type createApplicationFromJobDeps = {
  applicationRepository: applicationRepository;
  applicationLogRepository: applicationLogRepository;
  jobRepository: jobRepository;
};

export const createApplicationFromJobUseCase =
  (dependencies: createApplicationFromJobDeps) =>
  async (
    input: createApplicationFromJobInput
  ): Promise<result<application, jobNotFoundError>> => {
    const job = await dependencies.jobRepository.getById({ id: input.jobId });
    if (!job) {
      return err(new jobNotFoundError(input.jobId));
    }

    const now = new Date();
    const createdAt = toIsoNow();
    const applicationId = createId();
    const applicationRecord: application = {
      id: applicationId,
      company: job.company,
      role: job.role,
      status: "saved",
      priority: "medium",
      nextActionAt: addDaysDateOnly(now, 1),
      source: job.source,
      notes: "",
      createdAt,
      updatedAt: createdAt,
      jobId: job.id,
    };

    const logEntry: applicationLogEntry = {
      id: createId(),
      applicationId,
      type: "created_from_job",
      message: "Postulacion creada desde trabajo guardado.",
      createdAt,
    };

    await dependencies.applicationRepository.create({
      application: applicationRecord,
    });
    await dependencies.applicationLogRepository.create({ entry: logEntry });

    return ok(applicationRecord);
  };
