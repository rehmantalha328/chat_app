/*
  Warnings:

  - You are about to drop the column `msg_channel_id` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the `Messages_Channel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_msg_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages_Channel" DROP CONSTRAINT "Messages_Channel_reciever_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages_Channel" DROP CONSTRAINT "Messages_Channel_sender_id_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "msg_channel_id";

-- DropTable
DROP TABLE "Messages_Channel";
