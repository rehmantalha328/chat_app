/*
  Warnings:

  - You are about to drop the column `attatchment` on the `Messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "attatchment",
ADD COLUMN     "media_caption" TEXT;

-- CreateTable
CREATE TABLE "messages_media" (
    "media_id" TEXT NOT NULL,
    "message_id" TEXT,
    "media" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_media_pkey" PRIMARY KEY ("media_id")
);

-- AddForeignKey
ALTER TABLE "messages_media" ADD CONSTRAINT "messages_media_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Messages"("message_id") ON DELETE SET NULL ON UPDATE CASCADE;
