/*
  Warnings:

  - Added the required column `country_id` to the `Weekend_league` table without a default value. This is not possible if the table is not empty.
  - Added the required column `server_id` to the `Weekend_league` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `weekend_league` ADD COLUMN `country_id` INTEGER NOT NULL,
    ADD COLUMN `server_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Weekend_league` ADD CONSTRAINT `Weekend_league_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weekend_league` ADD CONSTRAINT `Weekend_league_server_id_fkey` FOREIGN KEY (`server_id`) REFERENCES `Game_server`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
