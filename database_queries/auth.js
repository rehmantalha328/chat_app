const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function getUserFromId(id) {
  return prisma.user.findFirst({
    // code goes here
  });
}

function getUserFromphone(phone) {
  return prisma.user.findFirst({
    // code goes here
  });
}



module.exports = {
  getUserFromphone,
  getUserFromId,
};
