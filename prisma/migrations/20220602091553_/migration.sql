-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "birthday" TEXT,
ADD COLUMN     "change_number_otp_verify" BOOLEAN DEFAULT false,
ADD COLUMN     "gender" TEXT;
