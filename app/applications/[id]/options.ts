export const statusOptions = [
  "saved",
  "applied",
  "screen",
  "tech",
  "offer",
  "rejected",
  "ghosted",
  "archived",
] as const;

export const priorityOptions = ["low", "medium", "high"] as const;

type statusOption = (typeof statusOptions)[number];
type priorityOption = (typeof priorityOptions)[number];

export const isStatusOption = (
  value: FormDataEntryValue | null
): value is statusOption =>
  typeof value === "string" && statusOptions.includes(value as statusOption);

export const isPriorityOption = (
  value: FormDataEntryValue | null
): value is priorityOption =>
  typeof value === "string" &&
  priorityOptions.includes(value as priorityOption);
