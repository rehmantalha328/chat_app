-- CreateTable
CREATE TABLE "reportUser" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT,
    "reported_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reportUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupReports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT,
    "group_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groupReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reportUser" ADD CONSTRAINT "reportUser_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportUser" ADD CONSTRAINT "reportUser_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupReports" ADD CONSTRAINT "groupReports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupReports" ADD CONSTRAINT "groupReports_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;
