-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_seen_show_to" "LastSeen" DEFAULT E'EVERYONE',
ADD COLUMN     "my_about_show_to" "LastSeen" DEFAULT E'EVERYONE',
ADD COLUMN     "profile_image_show_to" "LastSeen" DEFAULT E'EVERYONE';
