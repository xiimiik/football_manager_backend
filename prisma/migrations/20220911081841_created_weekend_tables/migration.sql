-- CreateTable
CREATE TABLE `Weekend_league` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isFull` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Weekend_league_players` (
    `leagueId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,

    PRIMARY KEY (`leagueId`, `playerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Weekend_match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user1_id` INTEGER NOT NULL,
    `user2_id` INTEGER NOT NULL,
    `score` VARCHAR(5) NULL,
    `leagueId` INTEGER NOT NULL,
    `logs` MEDIUMTEXT NULL,
    `time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Weekend_league_players` ADD CONSTRAINT `Weekend_league_players_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weekend_league_players` ADD CONSTRAINT `Weekend_league_players_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `Weekend_league`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weekend_match` ADD CONSTRAINT `Weekend_match_user1_id_fkey` FOREIGN KEY (`user1_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weekend_match` ADD CONSTRAINT `Weekend_match_user2_id_fkey` FOREIGN KEY (`user2_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weekend_match` ADD CONSTRAINT `Weekend_match_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `Weekend_league`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
