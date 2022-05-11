-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_group_creator_id_fkey";

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "group_name" DROP NOT NULL,
ALTER COLUMN "group_creator_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_group_creator_id_fkey" FOREIGN KEY ("group_creator_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
