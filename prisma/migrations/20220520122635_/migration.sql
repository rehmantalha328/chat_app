/*
  Warnings:

  - The `attatchment` column on the `group_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AUDIO', 'VIDEO', 'PICTURE');

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'LINK';

-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "attatchment",
ADD COLUMN     "attatchment" "MediaType",
ALTER COLUMN "message_type" DROP NOT NULL;
