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
  //   try {

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
  console.log(createGroup);
  return res.send(getSuccessData(createGroup));

  //   } catch (error) {
  //     if (error && error.message) {
  //       return res.status(404).send(error.message);
  //     }
  //     return res.status(404).send(error);
  //   }
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
    console.log("created message", createMessage);
    return res.send(getSuccessData(createMessage));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.get("/fetchMessages", trimRequest.all, async (req, res) => {
    
})

module.exports = router;

