-- AddForeignKey
ALTER TABLE "Group_messages" ADD CONSTRAINT "Group_messages_reciever_id_fkey" FOREIGN KEY ("reciever_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
