/*
  Warnings:

  - The primary key for the `Federated_credentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `strategy` on the `Federated_credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Federated_credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Federated_credentials" DROP CONSTRAINT "Federated_credentials_pkey",
DROP COLUMN "strategy",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT,
ADD CONSTRAINT "Federated_credentials_pkey" PRIMARY KEY ("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Federated_credentials_email_key" ON "Federated_credentials"("email");
