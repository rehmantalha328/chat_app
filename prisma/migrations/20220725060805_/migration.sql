-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "official_group_creator_id" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_official_group_creator_id_fkey" FOREIGN KEY ("official_group_creator_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
