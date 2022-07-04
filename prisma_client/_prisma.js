const { PrismaClient } = require("@prisma/client");

class Prisma_Client {
  static prismaClient = new PrismaClient({});

  static setupPrisma() {
    console.log("here in prisma static declaration");
  }
}

module.exports = Prisma_Client;
