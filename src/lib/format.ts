export const formatDate = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleDateString(locale);

export const formatDateTime = (value: string, locale = "es-MX") =>
  new Date(value).toLocaleString(locale);
