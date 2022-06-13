const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function isNotificationAllowed(user_id) {
  return prisma.user.findFirst({
    where: {
      user_id,
      notifications: true,
    },
  });
}

function isPrivateChatNotificationAllowed(user_id) {
  return prisma.user.findFirst({
    where: {
      user_id,
      is_private_chat_notifications: true,
    },
  });
}

function isGroupChatNotificationAllowed(user_id) {
  return prisma.user.findFirst({
    where: {
      user_id,
      is_group_chat_notifications: true,
    },
  });
}

function isGroupMuteFalse(group_id) {
  return prisma.groups.findFirst({
    where: {
      group_id,
    },
  });
}

module.exports = {
  isNotificationAllowed,
  isPrivateChatNotificationAllowed,
  isGroupChatNotificationAllowed,
  isGroupMuteFalse,
};
