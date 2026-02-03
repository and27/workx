import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { isoDateTime } from "@/src/domain/types/iso-date-time";
import { jobTriagePort } from "@/src/ports/job-triage";
import { jobCreateRecord, jobRepository } from "@/src/ports/job-repository";
import { toIsoNow } from "@/src/services/usecases/date-only";
import { err, ok, result } from "@/src/services/usecases/result";

export type createManualJobInput = {
  role?: string;
  company?: string;
  sourceUrl?: string | null;
  location?: string | null;
  seniority?: string | null;
  tags?: string[];
  description?: string | null;
  publishedAt?: isoDateTime | null;
  autoTriage?: boolean;
};

export type createManualJobOutput = {
  job: job;
  triage: {
    attempted: boolean;
    updated: boolean;
    error?: string;
  };
};

export type createManualJobDeps = {
  jobRepository: jobRepository;
  jobTriage: jobTriagePort;
  profile: userProfile;
};

const MIN_TRIAGE_CHARS = 200;

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const normalizeTags = (tags?: string[]) =>
  (tags ?? []).map((tag) => tag.trim()).filter(Boolean);

const shouldAutoTriage = (description: string, autoTriage?: boolean) =>
  autoTriage !== false && description.length >= MIN_TRIAGE_CHARS;

const nowIso = (): isoDateTime => toIsoNow();

export const createManualJobUseCase =
  (dependencies: createManualJobDeps) =>
  async (
    input: createManualJobInput = {}
  ): Promise<result<createManualJobOutput, Error>> => {
    const role = normalizeText(input.role);
    const company = normalizeText(input.company);
    if (!role) {
      return err(new Error("El rol es requerido."));
    }
    if (!company) {
      return err(new Error("La empresa es requerida."));
    }

    const description = normalizeText(input.description);
    const now = nowIso();

    const record: jobCreateRecord = {
      source: "Manual",
      role,
      company,
      sourceUrl: normalizeText(input.sourceUrl) || null,
      externalId: null,
      location: normalizeText(input.location) || "Remoto",
      seniority: normalizeText(input.seniority) || "No definido",
      tags: normalizeTags(input.tags),
      description: description.length > 0 ? description : null,
      publishedAt: input.publishedAt ?? now,
    };

    let created: job;
    try {
      created = await dependencies.jobRepository.create({
        job: record,
        now,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error("No pudimos crear el job."));
    }

    if (!record.description || !shouldAutoTriage(record.description, input.autoTriage)) {
      return ok({
        job: created,
        triage: { attempted: false, updated: false },
      });
    }

    try {
      const decision = await dependencies.jobTriage.coarse({
        job: created,
        profile: dependencies.profile,
      });
      if (!decision) {
        return ok({
          job: created,
          triage: { attempted: true, updated: false },
        });
      }

      const triagedAt = now;
      const updated = await dependencies.jobRepository.updateTriage({
        id: created.id,
        patch: {
          triageStatus: decision.status,
          triageReasons: decision.reasons,
          triagedAt,
          triageProvider: decision.provider,
          triageVersion: dependencies.profile.profileVersion,
        },
      });

      return ok({
        job: updated,
        triage: { attempted: true, updated: true },
      });
    } catch (error) {
      return ok({
        job: created,
        triage: {
          attempted: true,
          updated: false,
          error:
            error instanceof Error
              ? error.message
              : "No pudimos analizar el job.",
        },
      });
    }
  };
