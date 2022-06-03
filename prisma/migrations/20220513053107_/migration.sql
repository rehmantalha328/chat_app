-- CreateTable
CREATE TABLE "message_reciever" (
    "id" TEXT NOT NULL,
    "message_id" VARCHAR(255) NOT NULL,
    "reciever_id" VARCHAR(255) NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_reciever_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message_reciever" ADD CONSTRAINT "message_reciever_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reciever" ADD CONSTRAINT "message_reciever_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "group_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
