/*
  Warnings:

  - You are about to drop the `Group_msg_seen` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reciever_id` to the `Group_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group_msg_seen" DROP CONSTRAINT "Group_msg_seen_group_messagesId_fkey";

-- DropForeignKey
ALTER TABLE "Group_msg_seen" DROP CONSTRAINT "Group_msg_seen_user_id_fkey";

-- AlterTable
ALTER TABLE "Group_messages" ADD COLUMN     "reciever_id" TEXT NOT NULL,
ADD COLUMN     "seen_by_me" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Group_msg_seen";

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
