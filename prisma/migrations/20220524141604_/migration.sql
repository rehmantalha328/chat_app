/*
  Warnings:

  - You are about to drop the column `created_at` on the `groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "created_at",
ADD COLUMN     "last_message_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
