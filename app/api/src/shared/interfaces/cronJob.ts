import type { ScheduledTask } from 'node-cron';
import type { IVaccineStore } from './vaccine';

export interface ICronJob {
  name: string;
  task?: ScheduledTask;
  schedule: string;
  initialize(): void;
  execute(): Promise<void>;
}

export interface GetVaccinesWithLowStockParams {
  vaccineStore: IVaccineStore;
}
