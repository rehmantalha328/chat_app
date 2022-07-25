-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('PROJECT', 'AMA', 'GENERAL', 'OFFICIAL');

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "group_type" "GroupType";
