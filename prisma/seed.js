const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const { GroupType, UserRole } = require("@prisma/client");

const seedDatabase = async () => {
  const addAdminRecord = await prisma.user.create({
    data: {
      name: "ADMIN",
      email: "defigram_admin@defigram.com",
      password: "123456",
      role: UserRole.ADMIN,
    },
  });
  const createOfficialGroup = await prisma.groups.create({
    data: {
      is_group_chat: true,
      group_name: "Defigram.io News Channel",
      group_type: GroupType.OFFICIAL,
      last_message_time: new Date(),
      group_creator_id: addAdminRecord?.user_id,
      group_members: {
        create: {
          member_id: addAdminRecord?.user_id,
          is_admin: true,
        },
      },
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
