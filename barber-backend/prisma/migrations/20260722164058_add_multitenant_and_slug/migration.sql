/*
  Warnings:

  - You are about to drop the column `barbershopId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Barbershop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Barbershop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_barbershopId_fkey";

-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "barbershopId",
DROP COLUMN "role",
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserBarbershop" (
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "UserBarbershop_pkey" PRIMARY KEY ("userId","barbershopId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_slug_key" ON "Barbershop"("slug");

-- AddForeignKey
ALTER TABLE "UserBarbershop" ADD CONSTRAINT "UserBarbershop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBarbershop" ADD CONSTRAINT "UserBarbershop_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
