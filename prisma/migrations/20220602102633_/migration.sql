/*
  Warnings:

  - You are about to drop the column `change_number_otp_verify` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "change_number_otp_verify";
