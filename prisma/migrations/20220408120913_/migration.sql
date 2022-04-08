/*
  Warnings:

  - You are about to drop the column `creator_id` on the `Group_members` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Group_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Group_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group_members" DROP COLUMN "creator_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Group_messages" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;
