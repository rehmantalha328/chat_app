-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_group_chat_notifications" BOOLEAN DEFAULT true,
ADD COLUMN     "is_private_chat_notifications" BOOLEAN DEFAULT true,
ADD COLUMN     "notifications" BOOLEAN DEFAULT false;
