/*
  Warnings:

  - You are about to drop the column `online_status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `online_status_time` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "online_status",
DROP COLUMN "online_status_time";
