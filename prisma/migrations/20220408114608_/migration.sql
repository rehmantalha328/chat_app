/*
  Warnings:

  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "online_status" BOOLEAN DEFAULT false,
ADD COLUMN     "online_status_time" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "Otp" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Groups" (
    "group_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "group_name" VARCHAR(255) NOT NULL,
    "group_description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "Group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "Group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group_messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "reciever_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "message_body" TEXT,
    "attatchment" TEXT,

    CONSTRAINT "Group_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_members" ADD CONSTRAINT "Group_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_members" ADD CONSTRAINT "Group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
