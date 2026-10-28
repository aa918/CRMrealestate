-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'AGENT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WEBSITE', 'WHATSAPP', 'PHONE', 'REFERRAL', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'MEETING', 'PROPERTY_SENT', 'PROPERTY_VISIT', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('WAITING', 'RESPONDED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('BUY', 'RENT', 'SELL');

-- CreateEnum
CREATE TYPE "PropertyKind" AS ENUM ('APARTMENT', 'HOUSE', 'PENTHOUSE', 'DUPLEX', 'STUDIO', 'VILLA', 'LAND', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('OPEN', 'MEETING', 'OFFER', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'NOTE', 'LEAD_CREATED', 'STATUS_CHANGED', 'TASK_CREATED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ActivityDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "FacebookLeadStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "publicApiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "interestType" "InterestType",
    "propertyType" "PropertyKind",
    "city" TEXT,
    "budget" DECIMAL(14,2),
    "bedrooms" INTEGER,
    "message" TEXT,
    "responseStatus" "ResponseStatus" NOT NULL DEFAULT 'WAITING',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "firstResponseAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "propertyType" "PropertyKind" NOT NULL DEFAULT 'APARTMENT',
    "transactionType" "TransactionType" NOT NULL DEFAULT 'SALE',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "price" DECIMAL(14,2) NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "sizeSqm" INTEGER,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "leadId" TEXT,
    "propertyId" TEXT,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'OPEN',
    "probability" INTEGER NOT NULL DEFAULT 0,
    "expectedCloseDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT,
    "leadId" TEXT,
    "assignedUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'OTHER',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    "type" "ActivityType" NOT NULL,
    "direction" "ActivityDirection",
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageAccessToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_leads" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "pageId" TEXT NOT NULL,
    "formId" TEXT,
    "leadgenId" TEXT NOT NULL,
    "status" "FacebookLeadStatus" NOT NULL DEFAULT 'RECEIVED',
    "rawPayload" JSONB NOT NULL,
    "fetchedData" JSONB,
    "errorMessage" TEXT,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_publicApiKey_key" ON "organizations"("publicApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "contacts_organizationId_idx" ON "contacts"("organizationId");

-- CreateIndex
CREATE INDEX "contacts_organizationId_email_idx" ON "contacts"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_organizationId_phone_key" ON "contacts"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "leads_organizationId_idx" ON "leads"("organizationId");

-- CreateIndex
CREATE INDEX "leads_organizationId_status_idx" ON "leads"("organizationId", "status");

-- CreateIndex
CREATE INDEX "leads_organizationId_responseStatus_idx" ON "leads"("organizationId", "responseStatus");

-- CreateIndex
CREATE INDEX "leads_organizationId_assignedUserId_idx" ON "leads"("organizationId", "assignedUserId");

-- CreateIndex
CREATE INDEX "leads_organizationId_receivedAt_idx" ON "leads"("organizationId", "receivedAt");

-- CreateIndex
CREATE INDEX "properties_organizationId_idx" ON "properties"("organizationId");

-- CreateIndex
CREATE INDEX "properties_organizationId_city_idx" ON "properties"("organizationId", "city");

-- CreateIndex
CREATE INDEX "properties_organizationId_status_idx" ON "properties"("organizationId", "status");

-- CreateIndex
CREATE INDEX "deals_organizationId_idx" ON "deals"("organizationId");

-- CreateIndex
CREATE INDEX "deals_organizationId_stage_idx" ON "deals"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "deals_organizationId_ownerId_idx" ON "deals"("organizationId", "ownerId");

-- CreateIndex
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- CreateIndex
CREATE INDEX "tasks_organizationId_assignedUserId_idx" ON "tasks"("organizationId", "assignedUserId");

-- CreateIndex
CREATE INDEX "tasks_organizationId_status_idx" ON "tasks"("organizationId", "status");

-- CreateIndex
CREATE INDEX "tasks_organizationId_dueAt_idx" ON "tasks"("organizationId", "dueAt");

-- CreateIndex
CREATE INDEX "activities_organizationId_idx" ON "activities"("organizationId");

-- CreateIndex
CREATE INDEX "activities_organizationId_contactId_idx" ON "activities"("organizationId", "contactId");

-- CreateIndex
CREATE INDEX "activities_organizationId_leadId_idx" ON "activities"("organizationId", "leadId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_integrations_pageId_key" ON "facebook_integrations"("pageId");

-- CreateIndex
CREATE INDEX "facebook_integrations_organizationId_idx" ON "facebook_integrations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_leads_leadgenId_key" ON "facebook_leads"("leadgenId");

-- CreateIndex
CREATE INDEX "facebook_leads_organizationId_idx" ON "facebook_leads"("organizationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_integrations" ADD CONSTRAINT "facebook_integrations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_leads" ADD CONSTRAINT "facebook_leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_leads" ADD CONSTRAINT "facebook_leads_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
