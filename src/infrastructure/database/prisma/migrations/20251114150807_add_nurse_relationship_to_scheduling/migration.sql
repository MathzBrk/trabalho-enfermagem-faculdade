-- AlterTable
ALTER TABLE "vaccine_schedulings" ADD COLUMN     "assignedNurseId" TEXT;

-- CreateIndex
CREATE INDEX "vaccine_schedulings_scheduledDate_assignedNurseId_idx" ON "vaccine_schedulings"("scheduledDate", "assignedNurseId");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_assignedNurseId_idx" ON "vaccine_schedulings"("assignedNurseId");

-- AddForeignKey
ALTER TABLE "vaccine_schedulings" ADD CONSTRAINT "vaccine_schedulings_assignedNurseId_fkey" FOREIGN KEY ("assignedNurseId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
