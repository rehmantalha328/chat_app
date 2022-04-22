const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function getUserFromId(id) {
  return prisma.user.findFirst({
    where: {
      user_id: id,
    },
  });
};

function getUserFromphone(phone) {
  return prisma.user.findFirst({
    where: {
      phone,
    },
  });
};

function chkExistingUserName(username) {
  return prisma.user.findFirst({
    where: {
      username,
    },
  });
};

module.exports = {
  getUserFromphone,
  getUserFromId,
  chkExistingUserName,
};
