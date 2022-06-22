-- CreateTable
CREATE TABLE "User_gallery" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "picture_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_gallery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User_gallery" ADD CONSTRAINT "User_gallery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
