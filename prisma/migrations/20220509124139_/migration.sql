/*
  Warnings:

  - The values [SINGLE,GROUP] on the enum `chatType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `creator_id` on the `Groups` table. All the data in the column will be lost.
  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `admin_id` to the `Group_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "chatType_new" AS ENUM ('one_to_one', 'group_chat');
ALTER TABLE "Groups" ALTER COLUMN "chat_type" TYPE "chatType_new" USING ("chat_type"::text::"chatType_new");
ALTER TYPE "chatType" RENAME TO "chatType_old";
ALTER TYPE "chatType_new" RENAME TO "chatType";
DROP TYPE "chatType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_reciever_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "Group_members" ADD COLUMN     "admin_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Groups" DROP COLUMN "creator_id";

-- DropTable
DROP TABLE "Messages";

-- AddForeignKey
ALTER TABLE "Group_members" ADD CONSTRAINT "Group_members_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
