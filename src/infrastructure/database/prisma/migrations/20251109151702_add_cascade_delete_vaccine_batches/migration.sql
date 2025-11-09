-- DropForeignKey
ALTER TABLE "public"."vaccine_batches" DROP CONSTRAINT "vaccine_batches_vaccineId_fkey";

-- AddForeignKey
ALTER TABLE "vaccine_batches" ADD CONSTRAINT "vaccine_batches_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "vaccines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
