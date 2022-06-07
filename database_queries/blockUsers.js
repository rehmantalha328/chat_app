const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkIsAlreadyBlocked(blocker_id, blocked_id) {
  return prisma.blockProfile.findFirst({
    where: {
      blocker_id,
      blocked_id,
    },
  });
}

function blockUser(blocker_id, blocked_id) {
  return prisma.blockProfile.create({
    data: {
      blocker_id,
      blocked_id,
    },
  });
}

module.exports = {chkIsAlreadyBlocked,blockUser};