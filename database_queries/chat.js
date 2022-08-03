const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkMessageChannel(sender_id, reciever_id) {
  return prisma.groups.findFirst({
  //  code here
  });
};

function createMessageChannel(sender_id, reciever_id) {
  return prisma.groups.create({
    // code here
  });
};

function chkExistingGroup(group_id) {
  return prisma.groups.findFirst({
    // code here
  });
};

function chkExistingMember(member_id,group_id) {
  return prisma.group_members.findFirst({
  //  code here
  });
};


module.exports = { chkMessageChannel, createMessageChannel, chkExistingGroup, chkExistingMember, chkAdmin };
