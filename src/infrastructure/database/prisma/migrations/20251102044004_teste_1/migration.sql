-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'NURSE', 'MANAGER');

-- CreateEnum
CREATE TYPE "SchedulingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('GENERAL', 'BY_EMPLOYEE', 'BY_VACCINE', 'BY_PERIOD', 'COVERAGE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DOSE_REMINDER', 'VACCINE_EXPIRING', 'LOW_STOCK', 'SCHEDULING_CONFIRMED', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "coren" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "description" TEXT,
    "dosesRequired" INTEGER NOT NULL DEFAULT 1,
    "intervalDays" INTEGER,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 10,
    "isObligatory" BOOLEAN,
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_schedulings" (
    "id" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "SchedulingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "doseNumber" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vaccine_schedulings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_applications" (
    "id" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doseNumber" INTEGER NOT NULL DEFAULT 1,
    "batchNumber" TEXT NOT NULL,
    "applicationSite" TEXT NOT NULL,
    "observations" TEXT,
    "userId" TEXT NOT NULL,
    "vaccineId" TEXT NOT NULL,
    "appliedById" TEXT NOT NULL,
    "schedulingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vaccine_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "generatedById" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_coren_key" ON "users"("coren");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_userId_idx" ON "vaccine_schedulings"("userId");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_vaccineId_idx" ON "vaccine_schedulings"("vaccineId");

-- CreateIndex
CREATE INDEX "vaccine_schedulings_scheduledDate_idx" ON "vaccine_schedulings"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_applications_schedulingId_key" ON "vaccine_applications"("schedulingId");

-- CreateIndex
CREATE INDEX "vaccine_applications_userId_idx" ON "vaccine_applications"("userId");

-- CreateIndex
CREATE INDEX "vaccine_applications_vaccineId_idx" ON "vaccine_applications"("vaccineId");

-- CreateIndex
CREATE INDEX "vaccine_applications_appliedById_idx" ON "vaccine_applications"("appliedById");

-- CreateIndex
CREATE INDEX "vaccine_applications_applicationDate_idx" ON "vaccine_applications"("applicationDate");

-- CreateIndex
CREATE INDEX "reports_generatedById_idx" ON "reports"("generatedById");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- AddForeignKey
ALTER TABLE "vaccine_schedulings" ADD CONSTRAINT "vaccine_schedulings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_schedulings" ADD CONSTRAINT "vaccine_schedulings_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_applications" ADD CONSTRAINT "vaccine_applications_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "vaccine_schedulings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
