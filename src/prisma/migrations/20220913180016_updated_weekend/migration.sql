-- DropForeignKey
ALTER TABLE `weekend_league` DROP FOREIGN KEY `Weekend_league_country_id_fkey`;

-- AlterTable
ALTER TABLE `weekend_league` MODIFY `country_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Weekend_league` ADD CONSTRAINT `Weekend_league_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `Country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
