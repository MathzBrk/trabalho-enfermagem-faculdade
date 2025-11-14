/*
  Warnings:

  - You are about to drop the column `doseNumber` on the `vaccine_applications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `vaccine_applications` table. All the data in the column will be lost.
  - You are about to drop the column `vaccineId` on the `vaccine_applications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,vaccineId,doseNumber]` on the table `vaccine_schedulings` will be added. If there are existing duplicate values, this will fail.
  - Made the column `schedulingId` on table `vaccine_applications` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."vaccine_applications" DROP CONSTRAINT "vaccine_applications_schedulingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vaccine_applications" DROP CONSTRAINT "vaccine_applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vaccine_applications" DROP CONSTRAINT "vaccine_applications_vaccineId_fkey";

-- DropIndex
DROP INDEX "public"."vaccine_applications_userId_idx";

-- DropIndex
DROP INDEX "public"."vaccine_applications_userId_vaccineId_doseNumber_idx";

-- DropIndex
DROP INDEX "public"."vaccine_applications_userId_vaccineId_doseNumber_key";

-- DropIndex
DROP INDEX "public"."vaccine_applications_vaccineId_idx";

-- AlterTable
ALTER TABLE "vaccine_applications" DROP COLUMN "doseNumber",
DROP COLUMN "userId",
DROP COLUMN "vaccineId",
ALTER COLUMN "schedulingId" SET NOT NULL;

-- AlterTable
ALTER TABLE "vaccine_schedulings" ADD COLUMN     "assignedNurseId" TEXT;

-- CreateIndex
CREATE INDEX "vaccine_applications_schedulingId_idx" ON "vaccine_applications"("schedulingId");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_assignedNurseId_idx" ON "vaccine_schedulings"("assignedNurseId");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_scheduledDate_assignedNurseId_idx" ON "vaccine_schedulings"("scheduledDate", "assignedNurseId");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_schedulings_userId_vaccineId_doseNumber_key" ON "vaccine_schedulings"("userId", "vaccineId", "doseNumber");

-- AddForeignKey
ALTER TABLE "vaccine_schedulings" ADD CONSTRAINT "vaccine_schedulings_assignedNurseId_fkey" FOREIGN KEY ("assignedNurseId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "vaccine_schedulings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
