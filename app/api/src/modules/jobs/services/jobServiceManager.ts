import type { ICronJob } from '@shared/interfaces/cronJob';
import { injectable } from 'tsyringe';

@injectable()
export class JobServiceManager {
  private jobsMap: Map<string, ICronJob> = new Map();

  registerMany(jobs: ICronJob[]): void {
    for (const job of jobs) {
      this.register(job);
    }
  }

  initializeAll(): void {
    if (!this.jobsMap.size) {
      console.log('No jobs registered to initialize.');
      return;
    }
    for (const job of this.jobsMap.values()) {
      try {
        job.initialize();
        console.log(`Job ${job.name} initialized.`);
      } catch (error) {
        console.error(`Failed to initialize job ${job.name}:`, error);
      }
    }
  }

  private register(job: ICronJob): void {
    if (!this.jobsMap.has(job.name)) {
      this.jobsMap.set(job.name, job);
    }
  }
}
