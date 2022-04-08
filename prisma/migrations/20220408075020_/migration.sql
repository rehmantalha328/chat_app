/*
  Warnings:

  - You are about to drop the column `online_status_time` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - Made the column `Otp` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "online_status_time",
DROP COLUMN "updated_at",
ALTER COLUMN "Otp" SET NOT NULL;
