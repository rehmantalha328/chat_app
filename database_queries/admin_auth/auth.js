const { UserRole } = require("@prisma/client");
const Prisma_Client = require("../../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

const chkAdminExists = async (email) => {
  return prisma.user.findFirst({
    where: {
      email,
      role: UserRole.ADMIN,
    },
  });
};

const getUserFromId = async(id)=> {
  return prisma.user.findFirst({
    where: {
      user_id: id,
      role: UserRole.ADMIN,
    },
  });
}

module.exports = {
  chkAdminExists,
  getUserFromId,
};
