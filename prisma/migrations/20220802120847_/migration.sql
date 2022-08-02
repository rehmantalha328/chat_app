-- CreateEnum
CREATE TYPE "AdminApproval" AS ENUM ('APPROVED', 'BLOCKED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin_approval" "AdminApproval" NOT NULL DEFAULT E'APPROVED';
