-- CreateEnum
CREATE TYPE "IntegrationName" AS ENUM ('N8N', 'WHATSAPP', 'FACEBOOK');

-- CreateTable
CREATE TABLE "integration_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "integration" "IntegrationName" NOT NULL,
    "event" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_logs_organizationId_integration_createdAt_idx" ON "integration_logs"("organizationId", "integration", "createdAt");

-- AddForeignKey
ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
