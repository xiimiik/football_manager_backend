/*
  Warnings:

  - Added the required column `level` to the `Weekend_league` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `weekend_league` ADD COLUMN `level` INTEGER NOT NULL;
