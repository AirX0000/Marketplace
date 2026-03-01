/*
  Warnings:

  - You are about to drop the column `referenceId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Marketplace" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "attributes" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photos" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "referenceId",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "receiverId" TEXT,
ADD COLUMN     "senderId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "details" TEXT,
    "location" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "counterAmount" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Marketplace_category_idx" ON "Marketplace"("category");

-- CreateIndex
CREATE INDEX "Marketplace_region_idx" ON "Marketplace"("region");

-- CreateIndex
CREATE INDEX "Marketplace_status_idx" ON "Marketplace"("status");

-- CreateIndex
CREATE INDEX "Marketplace_ownerId_idx" ON "Marketplace"("ownerId");

-- CreateIndex
CREATE INDEX "Marketplace_category_region_status_idx" ON "Marketplace"("category", "region", "status");

-- CreateIndex
CREATE INDEX "Marketplace_price_idx" ON "Marketplace"("price");

-- CreateIndex
CREATE INDEX "Marketplace_rating_idx" ON "Marketplace"("rating");

-- CreateIndex
CREATE INDEX "Marketplace_createdAt_idx" ON "Marketplace"("createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
