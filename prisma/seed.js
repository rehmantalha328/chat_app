const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const { GroupType, UserRole } = require("@prisma/client");

const seedDatabase = async () => {
  const addAdminRecord = await prisma.user.create({
    // code goes here
  });
  const createOfficialGroup = await prisma.groups.create({
    data: {
      // code goes here
    },
  });
};

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// This module is for seeding the database