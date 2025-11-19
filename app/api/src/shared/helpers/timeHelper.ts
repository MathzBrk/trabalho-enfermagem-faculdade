import dayjs from 'dayjs';

export const getCurrentTimestamp = (): number => {
  return dayjs().valueOf();
};

export const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export const getCurrentDate = (): Date => {
  return dayjs().toDate();
};

export const getDifferenceBetweenDatesInDays = (
  startDate: Date,
  endDate: Date,
): number => {
  const d1 = dayjs(startDate);
  const d2 = dayjs(endDate);
  return d2.diff(d1, 'day');
};

export const formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const getDate = (dateString: string): Date => {
  return dayjs(dateString).toDate();
};

export const transformTimestampToDate = (timestamp: number): Date => {
  return dayjs(timestamp).toDate();
};

export const isDateInFuture = (date: Date): boolean => {
  return dayjs(date).isAfter(dayjs());
};

export const isDateInPast = (date: Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

export const getStartOfDay = (date: Date): Date => {
  return dayjs(date).startOf('day').toDate();
};

export const getEndOfDay = (date: Date): Date => {
  return dayjs(date).endOf('day').toDate();
};

export const transformDateToTimestamp = (date: Date): number => {
  return dayjs(date).valueOf();
};

export const getMonthDays = (month: number, year: number) => {
  return dayjs().year(year).month(month).daysInMonth();
};

export const createDate = (day: number, month: number, year: number) => {
  return dayjs().year(year).month(month).date(day).toDate();
};
