/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole";

-- DropTable
DROP TABLE "Admin";
