-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "last_message_from" TEXT,
ADD COLUMN     "last_message_id" TEXT,
ALTER COLUMN "last_message_time" SET DATA TYPE TEXT;
