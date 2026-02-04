import { ingestRunRepository } from "@/src/ports/ingest-run-repository";
import { isoDateTime } from "@/src/domain/types/iso-date-time";

const DEFAULT_DAILY_CAP = 2;

const toStartOfTodayIso = (): isoDateTime => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return start.toISOString();
};

export const getDailyIngestCap = () => {
  const raw = process.env.INGEST_DAILY_CAP?.trim();
  if (!raw) return DEFAULT_DAILY_CAP;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_DAILY_CAP;
  return Math.max(0, Math.floor(parsed));
};

export type ingestStatus = {
  used: number;
  limit: number;
  remaining: number;
};

export const createGetIngestStatusUseCase =
  (dependencies: { ingestRunRepository: ingestRunRepository }) =>
  async (): Promise<ingestStatus> => {
    const limit = getDailyIngestCap();
    const used =
      limit > 0
        ? await dependencies.ingestRunRepository.count({
            since: toStartOfTodayIso(),
          })
        : 0;
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  };

export const getStartOfTodayIso = toStartOfTodayIso;
