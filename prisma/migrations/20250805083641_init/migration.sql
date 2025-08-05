-- CreateEnum
CREATE TYPE "public"."ProcessStage" AS ENUM ('JOB_SEARCH', 'JOB_OFFER', 'EMPLOYER_APPLICATION', 'COMMUNITY_ENDORSEMENT', 'PR_APPLICATION', 'WORK_PERMIT', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."RCIPEmployer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "verificationDetails" TEXT,

    CONSTRAINT "RCIPEmployer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "noc" TEXT NOT NULL,
    "teerLevel" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "website" TEXT,
    "restrictions" TEXT,
    "approvalRate" DOUBLE PRECISION,
    "costOfLiving" DOUBLE PRECISION,
    "immigrantSupport" TEXT,
    "jobDemand" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationProcess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" "public"."ProcessStage" NOT NULL,
    "communityId" TEXT NOT NULL,
    "endorsementDate" TIMESTAMP(3),
    "medicalDate" TIMESTAMP(3),
    "biometricsDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimatedPRDate" TIMESTAMP(3),
    "source" TEXT,
    "additionalData" TEXT,

    CONSTRAINT "ApplicationProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "processId" TEXT NOT NULL,
    "aiReviewScore" DOUBLE PRECISION,
    "aiComments" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "actionRequired" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RCIPEmployer_name_communityId_key" ON "public"."RCIPEmployer"("name", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceUrl_employerId_key" ON "public"."Job"("sourceUrl", "employerId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "public"."Community"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationProcess_userId_communityId_key" ON "public"."ApplicationProcess"("userId", "communityId");

-- AddForeignKey
ALTER TABLE "public"."RCIPEmployer" ADD CONSTRAINT "RCIPEmployer_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "public"."RCIPEmployer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationProcess" ADD CONSTRAINT "ApplicationProcess_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."ApplicationProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
