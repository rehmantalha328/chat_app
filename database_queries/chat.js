const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkMessageChannel(sender_id, reciever_id) {
  return prisma.groups.findFirst({
    where: {
      OR: [
        {
          sender_id,
          reciever_id,
        },
        {
          sender_id: reciever_id,
          reciever_id: sender_id,
        },  
      ],
    },
  });
};

function createMessageChannel(sender_id, reciever_id) {
  return prisma.groups.create({
    data: {
      sender_id,
      reciever_id,
    },
  });
};

function chkExistingGroup(group_id) {
  return prisma.groups.findFirst({
    where: {
      group_id,
    },
    select: {
      group_id: true,
      group_name: true,
      group_image: true,
      last_message: true,
      last_message_id: true,
      last_message_sender: true,
      last_message_time: true,
      created_at: true,
      updated_at: true,
      group_members: {
        include: {
          member: {
            select: {
              user_id: true,
              username: true,
              profile_img: true
            }
          }
        }
      },
      group_messages: true,
    }
  });
};

function chkExistingMember(member_id,group_id) {
  return prisma.group_members.findFirst({
    where: {
      member_id,
      group_id,
    }
  });
};

function chkAdmin(group_id,admin_id) {
   return prisma.group_members.findFirst({
    where: {
      AND: [{
        group_id,
      }, {
        member_id: admin_id,
      }, {
        is_admin: true,
      }]
    }
  });
};

module.exports = { chkMessageChannel, createMessageChannel, chkExistingGroup, chkExistingMember, chkAdmin };
