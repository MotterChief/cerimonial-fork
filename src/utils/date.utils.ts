/**
 * Converts a Date object to a 'YYYY-MM-DD' string, respecting the local date
 * and avoiding timezone conversions that can shift the date.
 * @param date The date object to convert.
 * @returns A string in 'YYYY-MM-DD' format.
 */
export const toDate = (date: Date): string => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is zero-based
  const day = date.getDate();

  // Pad month and day with a leading zero if needed
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');

  return `${year}-${monthStr}-${dayStr}`;
};

/**
 * Creates a Date object from a 'YYYY-MM-DD' string, interpreting it in the local timezone
 * at midnight (00:00:00), to avoid timezone shifts when displaying dates.
 * @param dateString The date string in 'YYYY-MM-DD' format.
 * @returns A Date object, or null if the string is empty/invalid.
 */
export const createLocalDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-').map(Number);
  // Date constructor: year, month (0-indexed), day
  // Using local timezone parts to construct the date
  return new Date(parts[0], parts[1] - 1, parts[2]);
};
