const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const { getError, getSuccessData } = require("../helper_functions/helpers");
const { route } = require("./auth");
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
  try {
    let sender_id = req?.user?.user_id;
    let group_id = req.body.group_id;
    let message = req.body.message;
    const createMessage = await prisma.group_messages.create({
      data: {
        sender_id,
        group_id,
        message_body: message,
      },
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
    console.log(updateLastMessage);
    return res.send(getSuccessData(createMessage));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.get("/fetchMygroups", trimRequest.all, async (req, res) => {
  let user_id = req.user.user_id;
  // const getMyGroups = await prisma.user.findMany({
  //   where: {
  //     user_id,
  //   },
  //   select: {
  //     my_created_groups: {
  //       select: {
  //         group_id: true,
  //         group_name: true,
  //         group_description: true,
  //         group_members: {
  //           select: {
  //             member: {
  //               select: {
  //                 username: true,
  //                 phone: true,
  //               },
  //             },
  //           },
  //         },
  //         groupMessages: {
  //           select: {
  //             id: true,
  //             attatchment: true,
  //             message_body: true,
  //           },
  //         },
  //       },
  //     },
  //     my_joined_groups: {
  //       select: {
  //         group: {
  //           select: {
  //             group_id: true,
  //             group_name: true,
  //             groupMessages: {
  //               select: {
  //                 id: true,
  //                 attatchment: true,
  //                 message_body: true,
  //               },
  //             },
  //             group_members: {
  //               select: {
  //                 member: {
  //                   select: {
  //                     user_id: true,
  //                     username: true,
  //                     phone: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  const getMyGroups = await prisma.group_members.findMany({
    where: {
      member_id: user_id,
    },
    include: {
      group: {
        include: {
          last_message_sender: {
            select: {
              user_id: true,
              username: true,
              phone: true,
            },
          },
          groupMessages: {
            select: {
              id: true,
              message_body: true,
              attatchment: true,
              sender: {
                select: {
                  user_id: true,
                  username: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return res.send(getSuccessData(getMyGroups));
});

module.exports = router;
