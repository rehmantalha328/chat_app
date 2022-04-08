/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "Otp" INTEGER,
ADD COLUMN     "phone" VARCHAR(255) NOT NULL,
ADD COLUMN     "username" VARCHAR(255),
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "online_status" DROP NOT NULL;
