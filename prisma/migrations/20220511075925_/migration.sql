/*
  Warnings:

  - The `last_message_time` column on the `groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "last_message_time",
ADD COLUMN     "last_message_time" TIMESTAMP(3);
