const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const { getError, getSuccessData } = require("../helper_functions/helpers");
const { route } = require("./auth");
const { sendMessageToGroup } = require("../socket/socket");
// const {
// } = require("../database_queries/auth");

router.post("/createGroup", trimRequest.all, async (req, res) => {
  try {
    let creator_id = req?.user?.user_id;
    let groupDescription = req?.body?.groupDescription;
    let groupName = req?.body?.groupName;
    let groupMembers = [];

    if (req?.body?.member_id) {
      req.body.member_id.forEach((ids) => {
        groupMembers.push({
          member_id: ids,
        });
      });
    }
    const createGroup = await prisma.groups.create({
      data: {
        creator_id,
        group_description: groupDescription,
        group_name: groupName,
        group_members: {
          createMany: {
            data: groupMembers,
          },
        },
      },
    });
    const group_members = await prisma.group_members.create({
      data: {
        group_id: createGroup.group_id,
        member_id: creator_id,
        is_admin: true,
      },
    });
    return res.send(getSuccessData(createGroup));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(error.message);
    }
    return res.status(404).send(error);
  }
});

router.post("/groupChat", trimRequest.all, async (req, res) => {
  // try {
  let sender_id = req?.user?.user_id;
  let group_id = req.body.group_id;
  let message = req.body.message;
  let messageReciever = [];
  const getUsersFromGroup = await prisma.groups.findFirst({
    where: {
      group_id,
    },
    include: {
      group_members: {
        select: {
          member: {
            select: {
              user_id: true,
              username: true,
              phone: true,
            },
          },
        },
      },
    },
  });
  const reciever = getUsersFromGroup?.group_members?.filter(
    (user) => user?.member?.user_id !== sender_id
  );

  const createMessage = await prisma.group_messages.create({
    data: {
      sender_id,
      group_id,
      message_body: message,
    },
  });

  reciever?.forEach((user) => {
    messageReciever.push({
      message_id: createMessage?.id,
      reciever_id: user?.member?.user_id,
    });
  });
  const addReciever = await prisma.message_reciever.createMany({
    data: messageReciever,
  });
  const updateLastMessage = await prisma.groups.update({
    where: {
      group_id,
    },
    data: {
      last_message: message,
      last_message_time: new Date(),
      last_message_id: createMessage?.id,
      last_message_from: sender_id,
    },
  });

  sendMessageToGroup(sender_id, reciever, message);
  return res.status(200).send(getSuccessData(createMessage));
  // } catch (error) {
  //   if (error && error.message) {
  //     return res.status(404).send(getError(error.message));
  //   }
  //   return res.status(404).send(getError(error));
  // }
});

router.get("/fetchMygroups", trimRequest.all, async (req, res) => {
  let user_id = req.user.user_id;
  const getMyGroups = await prisma.group_members.findMany({
    where: {
      member_id: user_id,
    },
    include: {
      group: {
        include: {
          group_creator: {
            select: {
              user_id: true,
              username: true,
              phone: true,
            },
          },
          group_members: {
            select: {
              is_admin: true,
              member: {
                select: {
                  user_id: true,
                  username: true,
                  phone: true,
                },
              },
            },
          },
          last_message_sender: {
            select: {
              user_id: true,
              username: true,
              phone: true,
              profile_picture: true,
            },
          },
          groupMessages: {
            select: {
              reciver: {
                select: {
                  seen: true,
                  reciever_id: true,
                  message: {
                    select: {
                      id: true,
                      message_body: true,
                    },
                  },
                },
              },
            },
          },
          // groupMessages: {
          //   where: {
          //     OR: [
          //       {
          //         sender_id: user_id,
          //       },
          //       {
          //         reciever_id: user_id,
          //       },
          //     ],
          //   },
          //   select: {
          //     attatchment: true,
          //     message_body: true,
          //     message_type: true,
          //     created_at: true,
          //     seen_by_me: true,
          //     sender_id: true,
          //     reciever_id: true,
          //     created_at: true,
          //     sender: {
          //       select: {
          //         user_id: true,
          //         username: true,
          //         profile_picture: true,
          //       },
          //     },
          //   },
          //   orderBy: {
          //     created_at: "desc",
          //   },
          // },
        },
      },
    },
  });
  let newArray = [];
  getMyGroups?.forEach((data) => {
    data?.group?.groupMessages?.forEach((data) => {
      data?.reciver?.forEach((data) => {
        newArray.push(data);
      })
    });
  });

  let unseenCounter = 0;
  for (let i = 0; i < newArray?.length; i++) {
    if (newArray[i]?.reciever_id === user_id && newArray[i]?.seen === false) {
      unseenCounter++;
    }
  }
  return res.send(getSuccessData({getMyGroups,unseenCounter}));
});

router.get("/fetchMyMessages", trimRequest.all, async (req, res) => {
  let user_id = req.user.user_id;
  const getMyGroups = await prisma.group_messages.findMany({
    where: {
      OR: [
        {
          sender_id: user_id,
        },
        {
          reciver: {
            some: {
              reciever_id: user_id,
            },
          },
        },
      ],
    },
    orderBy: {
      created_at: 'desc',
    }
  });
  return res.send(getSuccessData(getMyGroups));
});

module.exports = router;
