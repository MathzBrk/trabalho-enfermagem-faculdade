import { LowStockCheckJob } from '@modules/jobs/handlers/lowStockCheckJob';
import type {
  GetVaccinesWithLowStockParams,
  ICronJob,
} from '@shared/interfaces/cronJob';
import type { DependencyContainer } from 'tsyringe';

export const SERVER_CRON_JOBS = [LowStockCheckJob] as const;

export const getVaccinesWithLowStock = async (
  params: GetVaccinesWithLowStockParams,
) => {
  const { vaccineStore } = params;

  const allVaccines = await vaccineStore.findAll();

  if (!allVaccines.length) {
    console.log('No vaccines found.');
    return [];
  }

  const vaccinesWithLowStock = allVaccines.filter((vaccine) => {
    return vaccine.totalStock <= vaccine.minStockLevel;
  });

  if (!vaccinesWithLowStock.length) {
    console.log('No vaccines with low stock levels found.');
    return [];
  }

  console.log('Vaccines with low stock levels found:', vaccinesWithLowStock);

  return vaccinesWithLowStock;
};

export const getAndResolveAllCronJobs = (container: DependencyContainer) => {
  const jobs: ICronJob[] = SERVER_CRON_JOBS.map((job) => {
    if (!container.isRegistered(job)) {
      container.registerSingleton<ICronJob>(job, job);
    }
    return container.resolve<ICronJob>(job);
  });

  return jobs;
};
