const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkIsAlreadyBlocked(blocker_id, blocked_id) {
  return prisma.blockProfile.findFirst({
  //  Code here
  });
}

function blockUser(blocker_id, blocked_id) {
  return prisma.blockProfile.create({
    // Code here
  });
}

function unblockUser(id) {
  return prisma.blockProfile.delete({
    // Code here
  });
}

module.exports = {
  chkIsAlreadyBlocked,
  blockUser,
  unblockUser,
};
