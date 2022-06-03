/*
  Warnings:

  - You are about to drop the column `reciever_id` on the `Group_messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_reciever_id_fkey";

-- AlterTable
ALTER TABLE "Group_messages" DROP COLUMN "reciever_id";
