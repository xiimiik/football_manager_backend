-- CreateTable
CREATE TABLE "Training" (
    "playerId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("playerId")
);

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
