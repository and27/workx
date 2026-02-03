export const formatDate = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleDateString(locale);

export const formatDateTime = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleString(locale);

export const formatRelativeDate = (
  value: string | null,
  locale = "es-MX"
) => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) {
    return parsed.toLocaleDateString(locale);
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d`;
  }
  if (totalHours > 0) {
    return `${totalHours}h`;
  }
  return `${Math.max(minutes, 0)}m`;
};
