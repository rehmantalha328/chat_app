/*
  Warnings:

  - You are about to drop the column `group_message_reciever_id` on the `group_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "group_message_reciever_id";
