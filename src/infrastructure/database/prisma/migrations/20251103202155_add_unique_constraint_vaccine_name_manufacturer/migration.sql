/*
  Warnings:

  - A unique constraint covering the columns `[name,manufacturer]` on the table `vaccines` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vaccines_name_manufacturer_key" ON "vaccines"("name", "manufacturer");
