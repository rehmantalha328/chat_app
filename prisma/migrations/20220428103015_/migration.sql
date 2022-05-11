-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_creator_id_fkey";

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "reciever_id" TEXT,
ADD COLUMN     "sender_id" TEXT,
ALTER COLUMN "creator_id" DROP NOT NULL,
ALTER COLUMN "group_name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
