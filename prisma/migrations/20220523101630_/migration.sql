/*
  Warnings:

  - The `media_type` column on the `group_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `attatchment` column on the `group_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "media_type",
ADD COLUMN     "media_type" "MediaType",
DROP COLUMN "attatchment",
ADD COLUMN     "attatchment" TEXT;
