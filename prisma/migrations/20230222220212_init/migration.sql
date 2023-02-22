-- CreateTable
CREATE TABLE "Weekend_league_next_level" (
    "id" SERIAL NOT NULL,
    "isFull" BOOLEAN NOT NULL,
    "server_id" INTEGER NOT NULL,
    "country_id" INTEGER,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Weekend_league_next_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weekend_league_players_next_level" (
    "leagueId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "Weekend_league_players_next_level_pkey" PRIMARY KEY ("leagueId","playerId")
);

-- CreateTable
CREATE TABLE "Weekend_match_next_level" (
    "id" SERIAL NOT NULL,
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,
    "score" VARCHAR(5),
    "leagueId" INTEGER NOT NULL,
    "logs" TEXT,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weekend_match_next_level_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Weekend_league_next_level" ADD CONSTRAINT "Weekend_league_next_level_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league_next_level" ADD CONSTRAINT "Weekend_league_next_level_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "Game_server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league_players_next_level" ADD CONSTRAINT "Weekend_league_players_next_level_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_league_players_next_level" ADD CONSTRAINT "Weekend_league_players_next_level_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "Weekend_league_next_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match_next_level" ADD CONSTRAINT "Weekend_match_next_level_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match_next_level" ADD CONSTRAINT "Weekend_match_next_level_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekend_match_next_level" ADD CONSTRAINT "Weekend_match_next_level_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "Weekend_league_next_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
