/*
  Warnings:

  - You are about to drop the column `avatar_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `avatar` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatar_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_id",
ADD COLUMN     "avatar" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_fkey" FOREIGN KEY ("avatar") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
