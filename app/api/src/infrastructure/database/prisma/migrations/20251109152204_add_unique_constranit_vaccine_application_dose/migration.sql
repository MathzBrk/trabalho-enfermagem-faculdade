/*
  Warnings:

  - A unique constraint covering the columns `[userId,vaccineId,doseNumber]` on the table `vaccine_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "vaccine_applications_userId_vaccineId_doseNumber_idx" ON "vaccine_applications"("userId", "vaccineId", "doseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_applications_userId_vaccineId_doseNumber_key" ON "vaccine_applications"("userId", "vaccineId", "doseNumber");
