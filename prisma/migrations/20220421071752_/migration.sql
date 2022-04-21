-- AlterTable
ALTER TABLE "User" ADD COLUMN     "online_status" BOOLEAN DEFAULT false,
ADD COLUMN     "online_status_time" TIMESTAMP(3);
