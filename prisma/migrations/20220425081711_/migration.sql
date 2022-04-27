/*
  Warnings:

  - You are about to drop the column `media_caption` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the `messages_media` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages_media" DROP CONSTRAINT "messages_media_message_id_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "media_caption",
ADD COLUMN     "media" TEXT;

-- DropTable
DROP TABLE "messages_media";
