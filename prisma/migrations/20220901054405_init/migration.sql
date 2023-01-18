-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `abbr` VARCHAR(5) NOT NULL,
    `logo` VARCHAR(191) NOT NULL,
    `avatar` INTEGER NOT NULL,
    `dollars` INTEGER NOT NULL DEFAULT 0,
    `cCoins` INTEGER NOT NULL DEFAULT 0,
    `sCoins` INTEGER NOT NULL DEFAULT 0,
    `tCoins` INTEGER NOT NULL DEFAULT 0,
    `isBot` BOOLEAN NOT NULL,
    `lastTactic` MEDIUMTEXT NULL,
    `lastTeam` MEDIUMTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_players` (
    `userId` INTEGER NOT NULL,
    `playersJson` MEDIUMTEXT NULL,
    `waitingPlayersJson` MEDIUMTEXT NULL,
    `tempPlayer` MEDIUMTEXT NULL,
    `tempAction` MEDIUMTEXT NULL,
    `tempDialogs` MEDIUMTEXT NULL,

    UNIQUE INDEX `User_players_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Federated_credentials` (
    `strategy` VARCHAR(20) NOT NULL,
    `accountId` VARCHAR(190) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`strategy`, `accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avatar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avatar_defying` (
    `avatar_id` INTEGER NOT NULL,
    `defeated_id` INTEGER NOT NULL,

    PRIMARY KEY (`avatar_id`, `defeated_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player1Id` INTEGER NOT NULL,
    `player2Id` INTEGER NOT NULL,
    `score` VARCHAR(5) NULL,
    `leagueId` INTEGER NOT NULL,
    `logs` MEDIUMTEXT NULL,
    `time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `League` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isFull` BOOLEAN NOT NULL,
    `level` INTEGER NOT NULL,
    `server_id` INTEGER NOT NULL,
    `country_id` INTEGER NOT NULL,

    INDEX `League_id_idx`(`id`),
    PRIMARY KEY (`level`, `server_id`, `country_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `League_players` (
    `leagueId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,

    PRIMARY KEY (`leagueId`, `playerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Region` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `region_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game_server` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `region_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_avatar_fkey` FOREIGN KEY (`avatar`) REFERENCES `Avatar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_players` ADD CONSTRAINT `User_players_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Federated_credentials` ADD CONSTRAINT `Federated_credentials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avatar_defying` ADD CONSTRAINT `Avatar_defying_avatar_id_fkey` FOREIGN KEY (`avatar_id`) REFERENCES `Avatar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avatar_defying` ADD CONSTRAINT `Avatar_defying_defeated_id_fkey` FOREIGN KEY (`defeated_id`) REFERENCES `Avatar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_player1Id_fkey` FOREIGN KEY (`player1Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_player2Id_fkey` FOREIGN KEY (`player2Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `League` ADD CONSTRAINT `League_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `League` ADD CONSTRAINT `League_server_id_fkey` FOREIGN KEY (`server_id`) REFERENCES `Game_server`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `League_players` ADD CONSTRAINT `League_players_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `League_players` ADD CONSTRAINT `League_players_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game_server` ADD CONSTRAINT `Game_server_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
