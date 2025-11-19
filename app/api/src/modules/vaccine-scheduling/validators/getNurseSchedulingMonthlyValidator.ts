import { z } from 'zod';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January, 11 = December)

export const GetNurseSchedulingMonthlyQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .default(String(currentMonth))
    .transform(Number)
    .pipe(
      z
        .number()
        .int('Month must be an integer')
        .min(0, 'Month must be between 0 and 11')
        .max(11, 'Month must be between 0 and 11'),
    ),
  year: z
    .string()
    .optional()
    .default(String(currentYear))
    .transform(Number)
    .pipe(
      z
        .number()
        .int('Year must be an integer')
        .min(2000, 'Year must be 2000 or later')
        .max(currentYear, `Year must not be in the future (max: ${currentYear})`),
    ),
});

export type GetNurseSchedulingMonthlyDTO = z.infer<
  typeof GetNurseSchedulingMonthlyQuerySchema
>;
