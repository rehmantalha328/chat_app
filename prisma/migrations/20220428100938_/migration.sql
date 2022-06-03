-- CreateEnum
CREATE TYPE "chatType" AS ENUM ('SINGLE', 'GROUP');

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "chat_type" "chatType";

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;
