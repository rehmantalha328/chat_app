/*
  Warnings:

  - You are about to drop the column `is_group_notification_mute` on the `groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "is_group_notification_mute";

-- CreateTable
CREATE TABLE "group_mute" (
    "id" TEXT NOT NULL,
    "group_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_mute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_mute" ADD CONSTRAINT "group_mute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_mute" ADD CONSTRAINT "group_mute_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;
