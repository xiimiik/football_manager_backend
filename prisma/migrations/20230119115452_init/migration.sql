-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" VARCHAR(5) NOT NULL,
    "logo" TEXT NOT NULL,
    "avatar" INTEGER NOT NULL,
    "dollars" INTEGER NOT NULL DEFAULT 0,
    "cCoins" INTEGER NOT NULL DEFAULT 0,
    "sCoins" INTEGER NOT NULL DEFAULT 0,
    "tCoins" INTEGER NOT NULL DEFAULT 0,
    "isBot" BOOLEAN NOT NULL,
    "lastTactic" TEXT,
    "lastTeam" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_players" (
    "userId" INTEGER NOT NULL,
    "playersJson" TEXT,
    "waitingPlayersJson" TEXT,
    "tempPlayer" TEXT,
    "tempAction" TEXT,
    "tempDialogs" TEXT,

    CONSTRAINT "User_players_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Federated_credentials" (
    "strategy" VARCHAR(20) NOT NULL,
    "accountId" VARCHAR(190) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Federated_credentials_pkey" PRIMARY KEY ("strategy","accountId")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar_defying" (
    "avatar_id" INTEGER NOT NULL,
    "defeated_id" INTEGER NOT NULL,

    CONSTRAINT "Avatar_defying_pkey" PRIMARY KEY ("avatar_id","defeated_id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "score" VARCHAR(5),
    "leagueId" INTEGER NOT NULL,
    "logs" TEXT,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" SERIAL NOT NULL,
    "isFull" BOOLEAN NOT NULL,
    "level" INTEGER NOT NULL,
    "server_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("level","server_id","country_id")
);

-- CreateTable
CREATE TABLE "League_players" (
    "leagueId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "League_players_pkey" PRIMARY KEY ("leagueId","playerId")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "region_id" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game_server" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,

    CONSTRAINT "Game_server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weekend_league" (
    "id" SERIAL NOT NULL,
    "isFull" BOOLEAN NOT NULL,
    "server_id" INTEGER NOT NULL,
    "country_id" INTEGER,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Weekend_league_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weekend_league_players" (
    "leagueId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "Weekend_league_players_pkey" PRIMARY KEY ("leagueId","playerId")
);

-- CreateTable
CREATE TABLE "Weekend_match" (
    "id" SERIAL NOT NULL,
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,
    "score" VARCHAR(5),
    "leagueId" INTEGER NOT NULL,
    "logs" TEXT,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weekend_match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tmp_table" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tmp_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "League_id_key" ON "League"("id");

-- CreateIndex
CREATE INDEX "League_id_idx" ON "League"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_fkey" FOREIGN KEY ("avatar") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_players" ADD CONSTRAINT "User_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Federated_credentials" ADD CONSTRAINT "Federated_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar_defying" ADD CONSTRAINT "Avatar_defying_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar_defying" ADD CONSTRAINT "Avatar_defying_defeated_id_fkey" FOREIGN KEY ("defeated_id") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Game_server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League_players" ADD CONSTRAINT "League_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League_players" ADD CONSTRAINT "League_players_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_server" ADD CONSTRAINT "Game_server_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league" ADD CONSTRAINT "Weekend_league_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league" ADD CONSTRAINT "Weekend_league_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Game_server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league_players" ADD CONSTRAINT "Weekend_league_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league_players" ADD CONSTRAINT "Weekend_league_players_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "Weekend_league"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match" ADD CONSTRAINT "Weekend_match_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match" ADD CONSTRAINT "Weekend_match_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match" ADD CONSTRAINT "Weekend_match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "Weekend_league"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
