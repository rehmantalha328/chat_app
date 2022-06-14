const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  signUpValidation,
} = require("../joi_validations/validate");
const { getError, getSuccessData } = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
var _ = require("lodash");

// SIMPLE SIGNUP USER
router.get("/searchAllUsers", [trimRequest.all], async (req, res) => {
  try {
    const allusers = await prisma.user.findMany({
      where: {
        is_registered: true,
        NOT: [
          {
            user_id: req?.user?.user_id,
          },
        ],
      },
      select: {
        username: true,
        user_id: true,
        phone: true,
        profile_img: true,
        online_status: true,
        online_status_time: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const users = allusers?.map((arr) => {
      arr.is_group_chat = false;
      return arr;
    });
    const updateArray = [...users];
    const sorted = _.orderBy(updateArray, ["created_at"], ["desc"]);
    if (allusers) return res.status(200).send(getSuccessData(sorted));
    return res.status(404).send(getError("no any user found"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});


router.get("/getMyAllData", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    let groups = [];
    let ChatMates = [];
    const group = true;
    const getAllRecord = await prisma.user.findFirst({
      where: {
        user_id,
      },
      select: {
        user_id: true,
        username: true,
        phone: true,
        profile_img: true,
        online_status: true,
        online_status_time: true,
        primary_user_channel: {
          select: {
            reciever: {
              select: {
                user_id: true,
                username: true,
                profile_img: true,
                phone: true,
                online_status: true,
                online_status_time: true,
                created_at: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
        secondary_user_channel: {
          select: {
            sender: {
              select: {
                user_id: true,
                username: true,
                phone: true,
                profile_img: true,
                online_status: true,
                online_status_time: true,
                created_at: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
        groups_i_created: {
          select: {
            group_id: true,
            group_name: true,
            group_image: true,
            group_description: true,
            group_creator_id: true,
            sender_id: true,
            reciever_id: true,
            is_group_chat: true,
            created_at: true,
            updated_at: true,
            last_message_time: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
        groups_i_joined: {
          where: {
            OR: [
              {
                is_admin: false,
              },
              {
                is_sub_admin: true,
              },
            ],
          },
          select: {
            group: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });
    let fetchAllRegisteredUsers = await prisma.user.findMany({
      where: {
        is_registered: true,
      },
      select: {
        user_id: true,
        profile_img: true,
        user_name: true,
        username: true,
        phone: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const myCreatedGroups = getAllRecord.groups_i_created;
    myCreatedGroups.forEach((data) => {
      groups.push({ groups: data });
    });
    const myJoinedGroups = getAllRecord.groups_i_joined;
    myJoinedGroups.forEach((data) => {
      groups.push({ groups: data });
    });
    const reciever = getAllRecord.primary_user_channel;
    const getReciever = reciever?.map((data) => {
      ChatMates.push({ chatMates: data.reciever });
    });
    const sender = getAllRecord.secondary_user_channel;
    const getSender = sender?.map((data) => {
      ChatMates.push({ chatMates: data.sender });
    });
    let merge = [...ChatMates, ...groups, ...fetchAllRegisteredUsers];
    return res.status(200).send(getSuccessData(merge));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
