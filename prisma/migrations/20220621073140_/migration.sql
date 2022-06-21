/*
  Warnings:

  - The `last_seen_show_to` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `my_about_show_to` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profile_image_show_to` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PrivacyType" AS ENUM ('EVERYONE', 'MY_CONTACTS', 'NOBODY');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_seen_show_to",
ADD COLUMN     "last_seen_show_to" "PrivacyType" DEFAULT E'EVERYONE',
DROP COLUMN "my_about_show_to",
ADD COLUMN     "my_about_show_to" "PrivacyType" DEFAULT E'EVERYONE',
DROP COLUMN "profile_image_show_to",
ADD COLUMN     "profile_image_show_to" "PrivacyType" DEFAULT E'EVERYONE';

-- DropEnum
DROP TYPE "About";

-- DropEnum
DROP TYPE "LastSeen";

-- DropEnum
DROP TYPE "ProfilePicture";
