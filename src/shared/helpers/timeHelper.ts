import dayjs from 'dayjs';

export const getCurrentTimestamp = (): number => {
  return dayjs().valueOf();
};

export const getCurrentDate = (): Date => {
  return dayjs().toDate();
};

export const formatDate = (
  date: Date,
  format: string = 'YYYY-MM-DD',
): string => {
  return dayjs(date).format(format);
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

export const transformDateToTimestamp = (date: Date): number => {
  return dayjs(date).valueOf();
};
