/*
  Warnings:

  - Added the required column `group_creator_id` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "group_creator_id" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_group_creator_id_fkey" FOREIGN KEY ("group_creator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
