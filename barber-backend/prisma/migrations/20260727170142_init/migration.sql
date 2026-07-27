/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Barber` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Barber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "whatsapp",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "openDays" TEXT[];

-- AlterTable
ALTER TABLE "Barbershop" DROP COLUMN "whatsapp",
ADD COLUMN     "maxBarbers" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "openDays" TEXT[];

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "whatsapp";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Barber_email_key" ON "Barber"("email");
