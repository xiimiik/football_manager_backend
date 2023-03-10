/*
  Warnings:

  - You are about to drop the `Training` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Training" DROP CONSTRAINT "Training_playerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "training" TEXT;

-- DropTable
DROP TABLE "Training";
