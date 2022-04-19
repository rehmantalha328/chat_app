-- CreateTable
CREATE TABLE "Group_msg_seen" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "group_messagesId" TEXT,

    CONSTRAINT "Group_msg_seen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Group_msg_seen" ADD CONSTRAINT "Group_msg_seen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_msg_seen" ADD CONSTRAINT "Group_msg_seen_group_messagesId_fkey" FOREIGN KEY ("group_messagesId") REFERENCES "Group_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
