-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcm_token" TEXT,
ALTER COLUMN "notifications" SET DEFAULT true;
