export const formatDate = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleDateString(locale);

export const formatDateTime = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleString(locale);

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const formatRelativeDate = (
  value: string | null,
  locale = "es-MX"
) => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  const today = startOfDay(new Date());
  const thatDay = startOfDay(parsed);
  const diffMs = today.getTime() - thatDay.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays > 1) return `Hace ${diffDays} dias`;

  return parsed.toLocaleDateString(locale);
};
