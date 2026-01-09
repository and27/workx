// YYYY-MM-DD in local time semantics.
export type dateOnly = string;

export const isDateOnly = (value: string): value is dateOnly =>
  /^\d{4}-\d{2}-\d{2}$/.test(value);
