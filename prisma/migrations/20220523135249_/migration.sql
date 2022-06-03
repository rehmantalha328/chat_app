/*
  Warnings:

  - You are about to drop the column `last_message` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_sender` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_sender_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_time` on the `groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "last_message",
DROP COLUMN "last_message_id",
DROP COLUMN "last_message_sender",
DROP COLUMN "last_message_sender_id",
DROP COLUMN "last_message_time";
