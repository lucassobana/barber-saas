/*
  Warnings:

  - A unique constraint covering the columns `[barberId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BARBER');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "barberId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "barberId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- CreateIndex
CREATE UNIQUE INDEX "User_barberId_key" ON "User"("barberId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
