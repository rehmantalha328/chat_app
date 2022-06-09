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

function unblockUser(id) {
  return prisma.blockProfile.delete({
    where: {
      id,
    },
  });
}

function chkIsAlreadyReported(reporter_id, reported_id) {
  return prisma.reportUser.findFirst({
    where: {
      reporter_id,
      reported_id,
    },
  });
}

function reportUser(reporter_id, reported_id,report_reason) {
  return prisma.reportUser.create({
    data: {
      reporter_id,
      reported_id,
      report_reason,
    },
  });
}

module.exports = {
  chkIsAlreadyBlocked,
  blockUser,
  unblockUser,
  chkIsAlreadyReported,
  reportUser,
};
