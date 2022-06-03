/*
  Warnings:

  - You are about to drop the `message_reciever` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message_reciever" DROP CONSTRAINT "message_reciever_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reciever" DROP CONSTRAINT "message_reciever_reciever_id_fkey";

-- DropTable
DROP TABLE "message_reciever";
