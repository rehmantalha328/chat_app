-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "group_picture" TEXT,
ALTER COLUMN "group_description" DROP NOT NULL;
