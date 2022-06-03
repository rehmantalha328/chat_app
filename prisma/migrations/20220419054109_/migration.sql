-- DropForeignKey
ALTER TABLE "Group_messages" DROP CONSTRAINT "Group_messages_reciever_id_fkey";

-- CreateTable
CREATE TABLE "message_reciever" (
    "id" TEXT NOT NULL,
    "message_id" TEXT,
    "reciever_id" TEXT,

    CONSTRAINT "message_reciever_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message_reciever" ADD CONSTRAINT "message_reciever_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reciever" ADD CONSTRAINT "message_reciever_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Group_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
