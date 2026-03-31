-- CreateEnum
CREATE TYPE "CodeStatus" AS ENUM ('GENERATED', 'PLAYED', 'REDEEMED');

-- CreateEnum
CREATE TYPE "PrizeTier" AS ENUM ('LOSS', 'SMALL', 'MEDIUM', 'JACKPOT');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "status" "CodeStatus" NOT NULL DEFAULT 'GENERATED',
    "prizeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playedAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "probability" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tier" "PrizeTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Code_code_key" ON "Code"("code");

-- CreateIndex
CREATE INDEX "Code_status_idx" ON "Code"("status");

-- CreateIndex
CREATE INDEX "Code_code_idx" ON "Code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
