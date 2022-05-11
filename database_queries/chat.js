const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkMessageChannel(sender_id, reciever_id) {
  return prisma.groups.findFirst({
    where: {
      OR: [
        {
          sender_id,
          reciever_id,
        },
        {
          sender_id: reciever_id,
          reciever_id: sender_id,
        },
      ],
    },
  });
}

function createMessageChannel(sender_id, reciever_id) {
  return prisma.groups.create({
    data: {
      sender_id,
      reciever_id,
    },
  });
}

module.exports = { chkMessageChannel, createMessageChannel };
