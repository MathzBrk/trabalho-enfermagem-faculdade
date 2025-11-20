import { TOKENS } from '@infrastructure/di/tokens';
import {
  EventNames,
  type IEventBus,
  type LowStockEvent,
} from '@modules/notifications';
import { LOW_STOCK_CHECK_JOB_NAME } from '@shared/constants/cronJobs';
import { getVaccinesWithLowStock } from '@shared/helpers/cronJobHelper';
import type { ICronJob } from '@shared/interfaces/cronJob';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import pLimit from 'p-limit';
import { inject, injectable } from 'tsyringe';

@injectable()
export class LowStockCheckJob implements ICronJob {
  name: string;
  task?: ScheduledTask;
  schedule: string;
  limit!: pLimit.Limit;

  constructor(
    @inject(TOKENS.IVaccineStore)
    private vaccineStore: IVaccineStore,
    @inject(TOKENS.IEventBus)
    private eventBus: IEventBus,
  ) {
    this.name = LOW_STOCK_CHECK_JOB_NAME;
    this.schedule = '0 10 * * *'; // Every day at 10:00 AM
    this.task = undefined;
    this.initializePlimit();
  }

  initialize(): void {
    if (!cron.validate(this.schedule)) {
      throw new Error(`Invalid cron schedule: ${this.schedule}`);
    }
    this.task = cron.schedule(
      this.schedule,
      async () => {
        await this.execute();
      },
      {
        timezone: 'America/Sao_Paulo',
      },
    );
  }

  initializePlimit(): void {
    this.limit = pLimit(5);
  }

  async execute(): Promise<void> {
    try {
      const vaccinesWithLowStock = await getVaccinesWithLowStock({
        vaccineStore: this.vaccineStore,
      });

      if (!vaccinesWithLowStock.length) {
        return;
      }

      await Promise.all(
        vaccinesWithLowStock.map((vaccine) =>
          this.limit(async () => {
            this.eventBus.emit<LowStockEvent>(EventNames.LOW_STOCK, {
              type: EventNames.LOW_STOCK,
              channels: ['in-app'],
              data: {
                currentStock: vaccine.totalStock,
                vaccineId: vaccine.id,
                vaccineName: vaccine.name,
                manufacturer: vaccine.manufacturer,
                minStockLevel: vaccine.minStockLevel,
                stockPercentage: Math.round(
                  (vaccine.totalStock / vaccine.minStockLevel) * 100,
                ),
              },
            });
          }),
        ),
      );
      console.log('LowStockCheckJob executed successfully.');
    } catch (error) {
      console.error(`Error executing ${this.name}:`, error);
    }
  }
}
