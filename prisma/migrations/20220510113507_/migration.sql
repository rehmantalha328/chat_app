/*
  Warnings:

  - You are about to drop the `Group_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_reciever` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group_members" DROP CONSTRAINT "Group_members_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_members" DROP CONSTRAINT "Group_members_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_members" DROP CONSTRAINT "Group_members_member_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_last_message_from_fkey";

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_reciever_id_fkey";

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reciever" DROP CONSTRAINT "message_reciever_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reciever" DROP CONSTRAINT "message_reciever_reciever_id_fkey";

-- DropTable
DROP TABLE "Group_members";

-- DropTable
DROP TABLE "Group_messages";

-- DropTable
DROP TABLE "Groups";

-- DropTable
DROP TABLE "message_reciever";

-- DropEnum
DROP TYPE "chatType";

-- CreateTable
CREATE TABLE "groups" (
    "group_id" TEXT NOT NULL,
    "group_name" VARCHAR(255) NOT NULL,
    "group_image" VARCHAR(255),
    "group_description" VARCHAR(255),
    "sender_id" VARCHAR(255),
    "reciever_id" VARCHAR(255),
    "last_message_id" VARCHAR(255),
    "last_message" VARCHAR(255),
    "last_message_time" VARCHAR(255),
    "last_message_sender" VARCHAR(255),
    "is_group_chat" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "member_id" VARCHAR(255) NOT NULL,
    "group_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_messages" (
    "id" TEXT NOT NULL,
    "sender_id" VARCHAR(255),
    "reciever_id" VARCHAR(255),
    "group_id" VARCHAR(255),
    "message_body" VARCHAR(255),
    "attatchment" VARCHAR(255),
    "message_type" "MessageType" NOT NULL DEFAULT E'TEXT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
