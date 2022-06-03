-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'MEDIA');

-- CreateTable
CREATE TABLE "Messages" (
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "reciever_id" TEXT NOT NULL,
    "msg_channel_id" TEXT NOT NULL,
    "message_body" TEXT,
    "attatchment" TEXT,
    "message_type" "MessageType" NOT NULL DEFAULT E'TEXT',
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Messages_Channel" (
    "channel_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "reciever_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_Channel_pkey" PRIMARY KEY ("channel_id")
);

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_msg_channel_id_fkey" FOREIGN KEY ("msg_channel_id") REFERENCES "Messages_Channel"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages_Channel" ADD CONSTRAINT "Messages_Channel_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages_Channel" ADD CONSTRAINT "Messages_Channel_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
