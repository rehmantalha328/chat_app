/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `official_group_creator_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_official_group_creator_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "role" "UserRole";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "official_group_creator_id";

-- DropTable
DROP TABLE "Admin";
