export const startOfWeek = (date: Date): Date => {
  const normalized = new Date(date);
  const day = normalized.getDay();
  const diff = (day + 6) % 7;
  normalized.setDate(normalized.getDate() - diff);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const isoDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

/** Convert ISO yyyy-mm-dd to Mono's required dd-mm-yyyy format */
export const toMonoDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};
