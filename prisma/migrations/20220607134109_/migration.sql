-- CreateTable
CREATE TABLE "blockProfile" (
    "id" TEXT NOT NULL,
    "blocker_id" TEXT,
    "blocked_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blockProfile" ADD CONSTRAINT "blockProfile_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockProfile" ADD CONSTRAINT "blockProfile_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
