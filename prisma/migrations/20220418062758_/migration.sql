-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_reciever_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "Group_messages" ALTER COLUMN "sender_id" DROP NOT NULL,
ALTER COLUMN "reciever_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
