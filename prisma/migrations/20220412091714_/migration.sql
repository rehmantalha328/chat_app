/*
  Warnings:

  - You are about to drop the column `last_message` on the `Group_messages` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_time` on the `Group_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group_messages" DROP COLUMN "last_message",
DROP COLUMN "last_message_time";

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "last_message" TEXT,
ADD COLUMN     "last_message_time" TIMESTAMP(3);
