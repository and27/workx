import { dateOnly } from "@/src/domain/types/date-only";
import { isoDateTime } from "@/src/domain/types/iso-date-time";

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateOnly = (date: Date): dateOnly =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayDateOnly = (): dateOnly => toDateOnly(new Date());

export const addDaysDateOnly = (base: Date, days: number): dateOnly =>
  toDateOnly(
    new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, 0, 0, 0)
  );

export const toIsoNow = (): isoDateTime => new Date().toISOString();

export const compareDateOnly = (left: dateOnly, right: dateOnly) =>
  left.localeCompare(right);
