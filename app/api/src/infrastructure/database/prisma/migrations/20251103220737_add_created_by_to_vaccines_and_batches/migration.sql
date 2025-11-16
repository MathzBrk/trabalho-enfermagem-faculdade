/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `vaccine_applications` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `vaccines` table. All the data in the column will be lost.
  - Added the required column `batchId` to the `vaccine_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `vaccines` table without a default value. This is not possible if the table is not empty.
  - Made the column `isObligatory` on table `vaccines` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('AVAILABLE', 'EXPIRED', 'DEPLETED', 'DISCARDED');

-- AlterTable
ALTER TABLE "vaccine_applications" DROP COLUMN "batchNumber",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vaccines" DROP COLUMN "expirationDate",
DROP COLUMN "stockQuantity",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "totalStock" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "isObligatory" SET NOT NULL;

-- CreateTable
CREATE TABLE "vaccine_batches" (
    "id" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BatchStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vaccine_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_batches_batchNumber_key" ON "vaccine_batches"("batchNumber");

-- CreateIndex
CREATE INDEX "vaccine_batches_vaccineId_idx" ON "vaccine_batches"("vaccineId");

-- CreateIndex
CREATE INDEX "vaccine_batches_expirationDate_idx" ON "vaccine_batches"("expirationDate");

-- CreateIndex
CREATE INDEX "vaccine_batches_status_idx" ON "vaccine_batches"("status");

-- CreateIndex
CREATE INDEX "vaccine_batches_createdById_idx" ON "vaccine_batches"("createdById");

-- CreateIndex
CREATE INDEX "vaccine_applications_batchId_idx" ON "vaccine_applications"("batchId");

-- CreateIndex
CREATE INDEX "vaccines_createdById_idx" ON "vaccines"("createdById");

-- AddForeignKey
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_batches" ADD CONSTRAINT "vaccine_batches_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_batches" ADD CONSTRAINT "vaccine_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "vaccine_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
