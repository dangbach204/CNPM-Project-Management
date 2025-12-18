export const toISOStringOrNull = (
  date: Date | string | null | undefined
): string | null => {
  if (!date) return null;

  const parsed = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsed.getTime())) {
    console.warn(`Invalid date value received: ${date}`);
    return null;
  }

  return parsed.toISOString();
};

export const isValidISODate = (
  dateString: string | null | undefined
): boolean => {
  if (!dateString) return false;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const isoPattern =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoPattern.test(dateString);
};

/**
 * Parses a date string and returns a Date object if valid, undefined otherwise.
 * Use this to conditionally include dates in Sequelize payloads,
 * allowing PostgreSQL DEFAULTs to be used when no valid date is provided.
 */
export const parseDate = (
  dateString: string | null | undefined
): Date | undefined => {
  if (!dateString || !isValidISODate(dateString)) {
    return undefined;
  }
  return new Date(dateString);
};

const formatDate = toISOStringOrNull;
export default formatDate;
