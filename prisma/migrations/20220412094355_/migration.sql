-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_last_message_from_fkey" FOREIGN KEY ("last_message_from") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
