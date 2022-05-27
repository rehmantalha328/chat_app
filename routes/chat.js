const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
var _ = require("lodash");
const { MessageType, MediaType } = require("@prisma/client");
const {
  messageValidation,
  fetchMessageValidation,
  seenMessagesValidation,
  groupCreateValidation,
  addMembersInGroup,
  getAllMembers,
  removeMembersFromGroup,
  groupMessageSeen,
  chkWhoSeenInGroup,
} = require("../joi_validations/validate");
const {
  chkMessageChannel,
  createMessageChannel,
  chkExistingGroup,
  chkAdmin,
  chkExistingMember,
} = require("../database_queries/chat");
const { getUserFromId } = require("../database_queries/auth");
const {
  getError,
  getSuccessData,
  deleteExistigImg,
  createToken,
  deleteUploadedImage,
} = require("../helper_functions/helpers");
const {
  sendMessageToGroup,
  sendTextMessage,
  newGroupCreated,
  addMemberToGroup,
  removeMember,
  sendMediaMessage,
  sendMediaMessageToGroup,
} = require("../socket/socket");
const imagemulter = require("../middleWares/imageMulter");
const mediaMulter = require("../middleWares/media");
const { fs } = require("file-system");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");

router.post(
  "/createGroup",
  [imagemulter, trimRequest.all],
  async (req, res) => {
    try {
      const group_creator_id = req?.user?.user_id;
      const creator_name = req?.user?.username;
      const { error, value } = groupCreateValidation(req.body);
      if (error) {
        deleteExistigImg(req);
        return res.status(404).send(getError(error.details[0].message));
      }
      if (req.file_error) {
        deleteExistigImg(req);
        return res.status(404).send(req.file_error);
      }
      if (!req.file) {
        deleteExistigImg(req);
        return res.status(404).send(getError("Please Select group image"));
      }
      const { groupDescription, groupName } = value;
      let is_group_chat = true;
      let groupMembers = [];

      if (req?.body?.member_id == "") {
        deleteExistigImg(req);
        return res
          .status(404)
          .send(getError("Please add atleast one member to group"));
      }

      if (req?.file) {
        const file = req?.file;
        let { Location } = await uploadFile(file);
        var group_picture = Location;
      }
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const createGroup = await prisma.groups.create({
        data: {
          group_creator_id,
          group_description: groupDescription,
          group_name: groupName,
          is_group_chat,
          group_image: group_picture,
          // group_members: {
          //   createMany: {
          //     data: groupMembers,
          //   },
          // },
        },
      });
      req.body.member_id.forEach((ids) => {
        groupMembers.push({
          member_id: ids,
          group_id: createGroup?.group_id,
        });
      });
      const updateLastMessage = await prisma.groups.update({
        where: {
          group_id: createGroup?.group_id,
        },
        data: {
          last_message_time: new Date(),
        },
      });
      const create_admin = await prisma.group_members.create({
        data: {
          group_id: createGroup?.group_id,
          member_id: group_creator_id,
          is_admin: true,
        },
      });
      if (create_admin) {
        const create_members = await prisma.group_members.createMany({
          data: groupMembers,
        });
      }
      // const last_message = `${creator_name} added you in the group`;
      newGroupCreated(
        groupMembers,
        group_creator_id,
        creator_name,
        groupName,
        createGroup?.group_id,
        group_picture,
        // createGroup?.last_message !== null
        //   ? createGroup?.last_message
        //   : last_message,
        createGroup?.last_message_time,
        is_group_chat
      );
      return res.send(getSuccessData(createGroup));
    } catch (error) {
      deleteFile(group_picture);
      deleteExistigImg(req);
      if (error && error.message) {
        return res.status(404).send(error.message);
      }
      return res.status(404).send(error);
    }
  }
);

router.post("/getMembersInGroup", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = getAllMembers(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id } = value;
    const isGroupExists = await chkExistingGroup(group_id);
    if (!isGroupExists) {
      return res.status(404).send(getError("Group doesn't exists"));
    }
    const getAllGroupMembers = isGroupExists.group_members;
    if (getAllGroupMembers?.length == 0) {
      return res.status(200).send(getSuccessData("No member in this group"));
    }
    const allmem = _.orderBy(getAllGroupMembers, ["created_at"], ["asc"]);
    return res.status(200).send(getSuccessData(allmem));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.post("/addMembersInGroup", trimRequest.all, async (req, res) => {
  try {
    const admin_id = req?.user?.user_id;
    const { error, value } = addMembersInGroup(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id } = value;
    const getExistingGroup = await chkExistingGroup(group_id);
    if (!getExistingGroup) {
      return res.status(404).send(getError("Group doesn't exists"));
    }
    const chkGroupAdmin = await chkAdmin(group_id, admin_id);
    if (!chkGroupAdmin) {
      return res
        .status(404)
        .send(getError("Only admin can add members to this group"));
    }
    const groupMembers = [];
    req.body.member_id?.forEach((ids) => {
      groupMembers.push({
        member_id: ids,
        group_id: group_id,
      });
    });
    for (let i = 0; i < groupMembers?.length; i++) {
      const getExistingMembers = await prisma.group_members.findFirst({
        where: {
          AND: [
            {
              member_id: groupMembers[i].member_id,
            },
            {
              group_id: groupMembers[i].group_id,
            },
          ],
        },
      });
      if (getExistingMembers) {
        const getUser = await getUserFromId(getExistingMembers?.member_id);
        return res
          .status(404)
          .send(getError(`This member ${getUser?.username} already exists`));
      }
    }
    const addMember = await prisma.group_members.createMany({
      data: groupMembers,
    });
    if (!addMember) {
      return res
        .status(404)
        .send(
          getError("There is some error from server please try again later")
        );
    }
    addMemberToGroup(
      admin_id,
      groupMembers,
      group_id,
      getExistingGroup?.group_image,
      getExistingGroup?.group_name,
      getExistingGroup?.group_messages.length > 0
        ? getExistingGroup?.group_messages[0].message_body
          ? getExistingGroup?.group_messages[0].message_body
          : getExistingGroup?.group_messages[0].attatchment
        : null,
      getExistingGroup?.group_messages.length > 0
        ? getExistingGroup?.group_messages[0].created_at
        : null,
      (is_group_chat = true)
    );
    return res.status(200).send(getSuccessData(addMember));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(error.message);
    }
    return res.status(404).send(error);
  }
});

router.post("/removeMembersFromGroup", trimRequest.all, async (req, res) => {
  try {
    const admin_id = req?.user?.user_id;
    const { error, value } = removeMembersFromGroup(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id, member_id } = value;
    const chkGroupAdmin = await chkAdmin(group_id, admin_id);
    if (!chkGroupAdmin) {
      return res
        .status(404)
        .send(getError("Only admin can remove members from this group"));
    }
    if (member_id == admin_id) {
      return res
        .status(404)
        .send(getError("Actions cannot perform on same Ids"));
    }
    const getExistingGroup = await chkExistingGroup(group_id);
    if (!getExistingGroup) {
      return res.status(404).send(getError("Group doesn't exists"));
    }
    const findUser = await getUserFromId(member_id);
    if (!findUser) {
      return res.status(404).send(getError("User not found"));
    }
    const isMemberExists = await chkExistingMember(member_id, group_id);
    if (!isMemberExists) {
      return res.status(404).send(getError("Member not found"));
    }
    const removeUserFromGroup = await prisma.group_members.delete({
      where: {
        id: isMemberExists?.id,
      },
    });
    if (removeUserFromGroup) {
      removeMember(
        admin_id,
        member_id,
        group_id,
        (is_removed_from_group = true)
      );
      return res
        .status(200)
        .send(
          getSuccessData(
            `You successfully remove ${findUser?.username} from this group`
          )
        );
    }
    return res
      .status(404)
      .send(getSuccessData(`There is error please try again later`));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.post("/fetchMyMessages", trimRequest.all, async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const { error, value } = fetchMessageValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { is_group_chat, reciever_id, group_id } = value;
    if (is_group_chat == true) {
      const getGroup = await chkExistingGroup(group_id);
      if (!getGroup) {
        return res.status(404).send(getSuccessData("No Group Exists"));
      }
      const fetchGroupMessages = await prisma.groups.findFirst({
        where: {
          group_id,
        },
        select: {
          group_messages: {
            select: {
              id: true,
              attatchment: true,
              message_body: true,
              message_type: true,
              media_type: true,
              media_caption: true,
              sender_id: true,
              reciever_id: true,
              seen: true,
              created_at: true,
              updated_at: true,
              group_id: true,
              user_sender: {
                select: {
                  user_id: true,
                  username: true,
                  profile_img: true,
                  online_status: true,
                  online_status_time: true,
                },
              },
            },
          },
        },
      });
      const get = fetchGroupMessages?.group_messages;
      const msgs = _.orderBy(get, ["created_at"], ["desc"]);
      return res.status(200).send(getSuccessData(msgs));
    } else {
      const getGroup = await chkMessageChannel(sender_id, reciever_id);
      if (!getGroup) {
        return res.status(404).send(getSuccessData("No Channel Exists"));
      }
      const getMessages = await prisma.groups.findFirst({
        where: {
          group_id: getGroup?.group_id,
        },
        select: {
          group_messages: {
            select: {
              id: true,
              attatchment: true,
              message_body: true,
              message_type: true,
              media_caption: true,
              media_type: true,
              sender_id: true,
              reciever_id: true,
              seen: true,
              created_at: true,
              updated_at: true,
              group_id: true,
              user_sender: {
                select: {
                  user_id: true,
                  // username: true,
                  profile_img: true,
                  online_status: true,
                  online_status_time: true,
                },
              },
            },
          },
        },
      });
      const get = getMessages?.group_messages;
      const msgs = _.orderBy(get, ["created_at"], ["desc"]);
      return res.status(200).send(getSuccessData(msgs));
    }
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

router.post("/seen_messages_in_group", trimRequest.all, async (req, res) => {
  try {
    let reciever_id = req?.user?.user_id;
    const { error, value } = groupMessageSeen(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id } = value;
    const messageSeen = await prisma.message_reciever.updateMany({
      where: {
        AND: [
          {
            reciever_id,
          },
          {
            group_id,
          },
          {
            seen: false,
          },
        ],
      },
      data: {
        seen: true,
      },
    });
    if (messageSeen?.count <= 0) {
      return res.status(200).send(getSuccessData("No record found"));
    }
    return res.status(200).send(getSuccessData("Seen Successfull"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

router.post(
  "/sendMessages",
  [mediaMulter, trimRequest.all],
  async (req, res) => {
    try {
      let recieverData = [];
      let sender_id = req.user.user_id;
      let username = req?.user?.username;
      let profile_img = req?.user?.profile_img;
      let user_sender_group = {
        username: username,
        profile_img: profile_img,
      };
      let user_sender_one_to_one = {
        profile_img: profile_img,
      };
      const { error, value } = messageValidation(req.body);
      if (error) {
        deleteUploadedImage(req);
        return res.status(404).send(getError(error.details[0].message));
      }
      if (req.file_error) {
        deleteUploadedImage(req);
        return res.status(404).send(getError(req.file_error));
      }
      const {
        is_group_chat,
        reciever_id,
        group_id,
        message_type,
        media_type,
        media_caption,
        message_body,
      } = value;
      let media_data = [];
      let media = [];
      if (is_group_chat === true) {
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
        reciever?.forEach((data) => {
          recieverData.push({
            reciever_id: data.member.user_id,
            group_id,
          });
        });
        if (message_type === MessageType.MEDIA) {
          if (
            media_type != MediaType.AUDIO &&
            media_type != MediaType.PICTURE &&
            media_type != MediaType.VIDEO &&
            media_type != MediaType.DOCUMENT
          ) {
            return res
              .status(404)
              .send(
                getError(
                  `Only ${MediaType.AUDIO},${MediaType.VIDEO},${MediaType.PICTURE},&${MediaType.DOCUMENT} allowed`
                )
              );
          }
          if (req.files) {
            for (const file of req.files) {
              if (file) {
                let { Location } = await uploadFile(file);
                media_data.push({
                  sender_id,
                  group_id,
                  media_caption: media_caption ? media_caption : null,
                  media_type,
                  message_type,
                  attatchment: Location,
                });
                media.push({
                  sender_id,
                  group_id,
                  media_caption: media_caption ? media_caption : null,
                  media_type,
                  message_type,
                  attatchment: Location,
                  user_sender: user_sender_group,
                  message_time: new Date().toLocaleTimeString(),
                });
              }
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            }
          }
          // const createMessage = await prisma.group_messages.create({
          //   data: media_data,
          // });
          for (let i = 0; i < media_data?.length; i++) {
            var addMedia = await prisma.group_messages.create({
              data: {
                sender_id: media_data[i].sender_id,
                group_id: media_data[i].group_id,
                media_caption: media_data[i].media_caption,
                media_type: media_data[i].media_type,
                attatchment: media_data[i].attatchment,
                reciever: {
                  createMany: {
                    data: recieverData,
                  },
                },
              },
            });
          }
          const updateLastMessageTime = await prisma.groups.update({
            where: {
              group_id,
            },
            data: {
              last_message_time: new Date(),
            },
          });
          sendMediaMessageToGroup(sender_id, reciever, media);
          return res.status(200).send(getSuccessData(addMedia));
        }
        if (message_type === MessageType.TEXT) {
          media_data = null;
          deleteUploadedImage(req);
          const createMessage = await prisma.group_messages.create({
            data: {
              sender_id,
              group_id,
              message_body,
              message_type,
              reciever: {
                createMany: {
                  data: recieverData,
                },
              },
            },
          });
          const updateLastMessageTime = await prisma.groups.update({
            where: {
              group_id,
            },
            data: {
              last_message_time: createMessage?.created_at,
            },
          });
          sendMessageToGroup(
            sender_id,
            user_sender_group,
            reciever,
            message_body,
            (media = null),
            message_type,
            group_id
          );
          return res.status(200).send(getSuccessData(createMessage));
        }
        if (message_type === MessageType.LINK) {
          media_data = null;
          deleteUploadedImage(req);
          const createMessage = await prisma.group_messages.create({
            data: {
              sender_id,
              group_id,
              message_body,
              message_type,
              reciever: {
                createMany: {
                  data: recieverData,
                },
              },
            },
          });
          const updateLastMessageTime = await prisma.groups.update({
            where: {
              group_id,
            },
            data: {
              last_message_time: createMessage?.created_at,
            },
          });
          sendMessageToGroup(
            sender_id,
            user_sender_group,
            reciever,
            message_body,
            (media = null),
            message_type,
            group_id
          );
          return res.status(200).send(getSuccessData(createMessage));
        }
      } else {
        // const isBlock = await prisma.blockProfile.findFirst({
        //   where: {
        //     blocker_id: sender_id,
        //     blocked_id: reciever_id,
        //   },
        // });

        // const isBlockMe = await prisma.blockProfile.findFirst({
        //   where: {
        //     blocker_id: reciever_id,
        //     blocked_id: sender_id,
        //   },
        // });

        // if (isBlock) {
        //   return res
        //     .status(404)
        //     .send(
        //       getError(
        //         "You block this user! Please unblock first then you can send the message."
        //       )
        //     );
        // }
        // if (isBlockMe) {
        //   return res
        //     .status(404)
        //     .send(
        //       getError(
        //         "You blocked from this user! You can not send the message."
        //       )
        //     );
        // }
        const chkSender = await getUserFromId(sender_id);
        if (!chkSender) {
          return res.status(404).send(getError("Unauthorized user!"));
        }
        const chkReciever = await getUserFromId(reciever_id);
        if (!chkReciever) {
          return res
            .status(404)
            .send(getError("Reciever is not available in our record."));
        }
        if (reciever_id == sender_id) {
          return res
            .status(404)
            .send(getError("Message does not send to your self"));
        }
        let chkChannel = await chkMessageChannel(sender_id, reciever_id);
        if (!chkChannel) {
          chkChannel = await createMessageChannel(sender_id, reciever_id);
        }

        // if (req.files) {
        //   req.files.forEach((file) => {
        //     const fileName = file ? file.filename : null;
        //     if (fileName) {
        //       files.push({
        //         media: fileName,
        //         media_caption: media_caption? media_caption : null,
        //         sender_id,
        //         reciever_id,
        //         msg_channel_id: chkChannel
        //           ? chkChannel.channel_id
        //           : chkChannel.channel_id,
        //         message_type,
        //       });
        //       // media.push({
        //       //   media: fileName,
        //       //   media_caption: media_caption? media_caption : null,
        //       // });
        //     }
        //   });
        // }
        // console.log(files);
        // return;
        // s3 bucket for media
        // if (req.files) {
        //   for (const file of req.files) {
        //     if (file) {
        //       let { Location } = await uploadFile(file);
        //       files.push({
        //         attatchment: Location,
        //         sender_id,
        //         reciever_id,
        //         msg_channel_id: chkChannel
        //           ? chkChannel.channel_id
        //           : chkChannel.channel_id,
        //         message_type,
        //       });
        //       media.push({
        //         attatchment: Location,
        //       });
        //     }
        //     if (fs.existsSync(file.path)) {
        //       fs.unlinkSync(file.path);
        //     }
        //   }
        // }
        // if (message_type === MessageType.MEDIA && files.length >= 0) {
        //   const createMedia = await prisma.messages.createMany({
        //     data: files,
        //   });
        //   sendMediaMessage(sender_id, reciever_id, media, message_type);
        //   // Notifications
        //   // const isNotificationAllowed = await prisma.users.findFirst({
        //   //   where: {
        //   //     user_id: reciever_id,
        //   //     notifications: true,
        //   //   },
        //   // });
        //   // if (isNotificationAllowed) {
        //   //   const getFcmToken = await prisma.users.findFirst({
        //   //     where: {
        //   //       user_id: reciever_id,
        //   //     },
        //   //     select: {
        //   //       fcm_token: true,
        //   //     },
        //   //   });
        //   //   if (getFcmToken?.fcm_token) {
        //   //     SendNotification(getFcmToken.fcm_token, {
        //   //       // profile: profile_picture,
        //   //       title: fname + "" + lname,
        //   //       body: "Send you a attachment",
        //   //     })
        //   //       .then((res) => {
        //   //         console.log(res, "done");
        //   //       })
        //   //       .catch((error) => {
        //   //         console.log(error, "Error sending notification");
        //   //       });
        //   //   }
        //   // }
        //   // sendNotificationCounter(sender_id, reciever_id, true);
        //   return res.status(200).send(getSuccessData(createMedia));
        // }
        if (message_type === MessageType.MEDIA) {
          if (
            media_type != MediaType.AUDIO &&
            media_type != MediaType.PICTURE &&
            media_type != MediaType.VIDEO &&
            media_type != MediaType.DOCUMENT
          ) {
            return res
              .status(404)
              .send(
                getError(
                  `Only ${MediaType.AUDIO},${MediaType.VIDEO},${MediaType.PICTURE},&${MediaType.DOCUMENT} allowed`
                )
              );
          }
          if (req.files) {
            for (const file of req.files) {
              if (file) {
                let { Location } = await uploadFile(file);
                media_data.push({
                  sender_id,
                  reciever_id,
                  group_id: chkChannel
                    ? chkChannel.group_id
                    : chkChannel.group_id,
                  media_caption: media_caption ? media_caption : null,
                  media_type,
                  message_type,
                  attatchment: Location,
                });
                media.push({
                  sender_id,
                  reciever_id,
                  group_id: chkChannel
                    ? chkChannel.group_id
                    : chkChannel.group_id,
                  media_caption: media_caption ? media_caption : null,
                  media_type,
                  message_type,
                  attatchment: Location,
                  user_sender: user_sender_one_to_one,
                  message_time: new Date().toLocaleTimeString(),
                });
              }
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            }
          }
          const createMessage = await prisma.group_messages.createMany({
            data: media_data,
          });

          sendMediaMessage(
            sender_id,
            // user_sender_one_to_one,
            reciever_id,
            // media,
            // message_type,
            // chkChannel?.group_id
            media
          );
          if (createMessage?.count > 0) {
            return res.status(200).send(getSuccessData("Sent successful"));
          }
          return res
            .status(404)
            .send(getSuccessData("Issue in sending message"));
        }
        if (message_type === MessageType.TEXT) {
          media_data = null;
          deleteUploadedImage(req);
          const createMessage = await prisma.group_messages.create({
            data: {
              sender_id,
              reciever_id,
              group_id: chkChannel ? chkChannel.group_id : chkChannel.group_id,
              message_body,
              message_type,
            },
          });

          sendTextMessage(
            sender_id,
            user_sender_one_to_one,
            reciever_id,
            message_body,
            (media = null),
            message_type,
            chkChannel?.group_id
          );
          // Notifications
          // const isNotificationAllowed = await prisma.users.findFirst({
          //   where: {
          //     user_id: reciever_id,
          //     notifications: true,
          //   },
          // });
          // if (isNotificationAllowed) {
          //   const getFcmToken = await prisma.users.findFirst({
          //     where: {
          //       user_id: reciever_id,
          //     },
          //     select: {
          //       fcm_token: true,
          //     },
          //   });
          //   if (getFcmToken?.fcm_token) {
          //     SendNotification(getFcmToken.fcm_token, {
          //       // profile: profile_picture,
          //       title: fname + "" + lname,
          //       body: "Send you a message",
          //     })
          //       .then((res) => {
          //         console.log(res, "done");
          //       })
          //       .catch((error) => {
          //         console.log(error, "Error sending notification");
          //       });
          //   }
          // }
          // sendNotificationCounter(sender_id, reciever_id, true);
          return res.status(200).send(getSuccessData(createMessage));
        }
        if (message_type === MessageType.LINK) {
          media_data = null;
          deleteUploadedImage(req);
          const createMessage = await prisma.group_messages.create({
            data: {
              sender_id,
              reciever_id,
              group_id: chkChannel ? chkChannel.group_id : chkChannel.group_id,
              message_body,
              message_type,
            },
          });

          sendTextMessage(
            sender_id,
            user_sender_one_to_one,
            reciever_id,
            message_body,
            (media = null),
            message_type,
            chkChannel?.group_id
          );
          return res.status(200).send(getSuccessData(createMessage));
        }
      }
    } catch (catchError) {
      if (catchError && catchError.message) {
        return res.status(404).send(getError(catchError.message));
      }
      return res.status(404).send(getError(catchError));
    }
  }
);

router.get("/get_message_contacts", trimRequest.all, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const contacts = await prisma.user.findFirst({
      where: {
        user_id,
      },
      select: {
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
                // user_i_block: {
                //   where: {
                //     OR: [
                //       {
                //         blocker_id: user_id,
                //       },
                //       {
                //         blocked_id: user_id,
                //       },
                //     ],
                //   },
                // },
                // user_blocked_me: {
                //   where: {
                //     OR: [
                //       {
                //         blocked_id: user_id,
                //       },
                //       {
                //         blocker_id: user_id,
                //       },
                //     ],
                //   },
                // },
                i_send_messages: {
                  where: {
                    OR: [
                      {
                        sender_id: user_id,
                      },
                      {
                        reciever_id: user_id,
                      },
                    ],
                  },
                },
                i_recieve_messages: {
                  where: {
                    OR: [
                      {
                        reciever_id: user_id,
                      },
                      {
                        sender_id: user_id,
                      },
                    ],
                  },
                },
              },
            },
            group_messages: {
              orderBy: {
                created_at: "desc",
              },
            },
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
                // user_i_block: {
                //   where: {
                //     OR: [
                //       {
                //         blocker_id: user_id,
                //       },
                //       {
                //         blocked_id: user_id,
                //       },
                //     ],
                //   },
                // },
                // user_blocked_me: {
                //   where: {
                //     OR: [
                //       {
                //         blocked_id: user_id,
                //       },
                //       {
                //         blocker_id: user_id,
                //       },
                //     ],
                //   },
                // },
                i_send_messages: {
                  where: {
                    OR: [
                      {
                        reciever_id: user_id,
                      },
                      {
                        sender_id: user_id,
                      },
                    ],
                  },
                },
                i_recieve_messages: {
                  where: {
                    OR: [
                      {
                        sender_id: user_id,
                      },
                      {
                        reciever_id: user_id,
                      },
                    ],
                  },
                },
              },
            },
            group_messages: {
              orderBy: {
                created_at: "desc",
              },
            },
          },
        },
        groups_i_created: {
          select: {
            group_name: true,
            group_id: true,
            group_image: true,
            group_description: true,
            // last_message: true,
            last_message_time: true,
            // last_message_id: true,
            // last_message_sender: true,
            // last_message_sender_id: true,
            is_group_chat: true,
            created_at: true,
            updated_at: true,

            group_messages: {
              // include: {
              //   reciever: true,
              // },
              orderBy: {
                created_at: "desc",
              },
            },
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
            group: {
              select: {
                group_name: true,
                group_id: true,
                group_image: true,
                group_description: true,
                // last_message: true,
                last_message_time: true,
                // last_message_id: true,
                // last_message_sender: true,
                // last_message_sender_id: true,
                is_group_chat: true,
                created_at: true,
                updated_at: true,

                group_messages: {
                  // include: {
                  //   reciever: true,
                  // },
                  orderBy: {
                    created_at: "desc",
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    const first = contacts.primary_user_channel;
    const send = first?.map((arr) => {
      // if (arr.reciever.user_i_block.length > 0) {
      //   arr.reciever.is_user_i_block = true;
      // } else {
      //   arr.reciever.is_user_i_block = false;
      // }
      // if (arr.reciever.user_blocked_me.length > 0) {
      //   arr.reciever.is_user_block_me = true;
      // } else {
      //   arr.reciever.is_user_block_me = false;
      // }
      // delete arr.reciever.user_i_block;
      // delete arr.reciever.user_blocked_me;

      if (
        arr.reciever.i_send_messages.length > 0 &&
        arr.reciever.i_recieve_messages.length > 0
      ) {
        arr.reciever.is_chat_start = true;
      } else {
        arr.reciever.is_chat_start = false;
      }
      delete arr.reciever.i_send_messages;
      delete arr.reciever.i_recieve_messages;

      const obj = arr.reciever;
      obj.last_message =
        arr.group_messages.length > 0
          ? arr.group_messages[0].message_body
            ? arr.group_messages[0].message_body
            : arr.group_messages[0].attatchment
          : null;
      obj.last_message_time =
        arr.group_messages.length > 0 ? arr.group_messages[0].created_at : null;
      obj.un_seen_counter = arr.group_messages.filter(
        (ar) => ar.seen === false && ar.reciever_id === user_id
      ).length;
      obj.is_group_chat = false;
      let id;
      arr?.group_messages?.forEach((data) => {
        id = data?.group_id;
      });
      obj.group_id = id;
      return obj;
    });

    const second = contacts.secondary_user_channel;
    const recieve = second?.map((ary) => {
      // if (ary.sender.user_i_block.length > 0) {
      //   ary.sender.is_user_i_block = true;
      // } else {
      //   ary.sender.is_user_i_block = false;
      // }
      // if (ary.sender.user_blocked_me.length > 0) {
      //   ary.sender.is_user_block_me = true;
      // } else {
      //   ary.sender.is_user_block_me = false;
      // }
      // delete ary.sender.user_blocked_me;
      // delete ary.sender.user_i_block;

      const obj = ary.sender;
      if (obj.i_send_messages.length > 0 && obj.i_recieve_messages.length > 0) {
        obj.is_chat_start = true;
      } else {
        obj.is_chat_start = false;
      }
      delete obj.i_send_messages;
      delete obj.i_recieve_messages;

      obj.last_message =
        ary.group_messages.length > 0
          ? ary.group_messages[0].message_body
            ? ary.group_messages[0].message_body
            : ary.group_messages[0].attatchment
          : null;
      obj.last_message_time =
        ary.group_messages.length > 0 ? ary.group_messages[0].created_at : null;
      obj.un_seen_counter = ary.group_messages.filter(
        (ar) => ar.seen === false && ar.reciever_id === user_id
      ).length;
      obj.is_group_chat = false;
      let id;
      ary?.group_messages?.forEach((data) => {
        id = data?.group_id;
      });
      obj.group_id = id;
      return obj;
    });

    const my_created_groups = contacts.groups_i_created;
    const add = await Promise.all(
      my_created_groups?.map(async (data) => {
        data.last_message =
          data.group_messages.length > 0
            ? data.group_messages[0].message_body
              ? data.group_messages[0].message_body
              : data.group_messages[0].attatchment
            : null;
        // data.last_message_time =
        //   data.group_messages.length > 0
        //     ? data.group_messages[0].created_at
        //     : null;
        // let unseen_counter = data.group_messages.map((c) => {
        //   let rec = c.reciever;
        //   let test = [];
        //   let reciver = rec.concat(rec);
        //   test.push(
        //     {reciver}
        //   )
        //   let fff = test[0].reciver;
        //   let count = fff.filter(
        //     (chk) => chk.reciever_id === user_id && chk.seen === false && chk.group_id === data.group_id
        //   ).length;
        //   return count;
        // });
        // data.un_seen_counter = data.group_messages.length > 0? unseen_counter[0] : 0 ;

        const getUnseenCounter = await prisma.message_reciever.findMany({
          where: {
            reciever_id: user_id,
            group_id: data.group_id,
          },
        });
        let count = 0;
        for (let i = 0; i < getUnseenCounter.length; i++) {
          if (
            getUnseenCounter[i].reciever_id === user_id &&
            getUnseenCounter[i].group_id === data.group_id &&
            getUnseenCounter[i].seen === false
          ) {
            count++;
          }
        }
        console.log("count", count);
        data.un_seen_counter = count;
        return data;
      })
    );
    const fourth = contacts.groups_i_joined;

    const my_joined_groups = [];

    const chk = fourth?.forEach((ary) => {
      my_joined_groups.push({
        group_name: ary?.group?.group_name,
        group_id: ary?.group?.group_id,
        group_image: ary?.group?.group_image,
        group_description: ary?.group?.group_description,
        // last_message: ary?.group?.last_message,
        last_message_time: ary?.group?.last_message_time,
        // last_message_id: ary?.group?.last_message_id,
        // last_message_sender: ary?.group?.last_message_sender,
        // last_message_sender_id: ary?.group?.last_message_sender_id,
        is_group_chat: ary?.group?.is_group_chat,
        created_at: ary?.group?.created_at,
        updated_at: ary?.group?.updated_at,
        group_messages: ary?.group?.group_messages,
      });
    });
    const joined = await Promise.all(
      my_joined_groups.map(async (data) => {
        data.last_message =
          data.group_messages.length > 0
            ? data.group_messages[0].message_body
              ? data.group_messages[0].message_body
              : data.group_messages[0].attatchment
            : null;
        // data.last_message_time =
        //   data.group_messages.length > 0
        //     ? data.group_messages[0].created_at
        //     : null;
        // let unseen_counter = data.group_messages.map((c) => {
        //   let rec = c.reciever;
        //   let test = [];
        //   let reciver = rec.concat(rec);
        //   test.push(
        //     {reciver}
        //   )
        //   let fff = test[0].reciver;
        //   console.log("ff",fff);
        //   let count = fff.filter(
        //     (chk) => chk.reciever_id === user_id && chk.seen === false && chk.group_id === data.group_id
        //   ).length;
        //   console.log("count",count);
        //   return count;
        // });
        // data.un_seen_counter = data.group_messages.length > 0? unseen_counter[0] : 0 ;

        const getUnseenCounter = await prisma.message_reciever.findMany({
          where: {
            reciever_id: user_id,
            group_id: data.group_id,
          },
        });
        let count = 0;
        for (let i = 0; i < getUnseenCounter.length; i++) {
          if (
            getUnseenCounter[i].reciever_id === user_id &&
            getUnseenCounter[i].group_id === data.group_id &&
            getUnseenCounter[i].seen === false
          ) {
            count++;
          }
        }
        data.un_seen_counter = count;
        return data;
      })
    );
    const friend = [...send, ...recieve, ...add, ...joined];
    const sorted = _.orderBy(friend, ["last_message_time"], ["desc"]);
    return res.status(200).send(getSuccessData(sorted));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

router.post("/seen_messages", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = seenMessagesValidation(req.body);
    if (error) {
      return res.status(400).send(getError(error.details[0].message));
    }
    const reciever_id = req.user.user_id;
    const { sender_id } = value;
    const findSender = await getUserFromId(sender_id);
    if (!findSender) {
      return res.status(404).send(getError("User not found!"));
    }
    if (sender_id == reciever_id) {
      return res
        .status(404)
        .send(getError("sender id should be different from reciever id."));
    }
    // const message_id = await prisma.group_messages.findMany({
    //   where: {
    //     sender_id,
    //     reciever_id,
    //     seen: false,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });
    const is_seen = await prisma.group_messages.updateMany({
      where: {
        sender_id,
        reciever_id,
      },
      data: {
        seen: true,
      },
    });
    if (is_seen.count <= 0) {
      return res.status(200).send(getError("No data found"));
    }
    // seenMessages(reciever_id, sender_id, message_id, true);
    return res.status(200).send(getSuccessData("Successfully done"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(400).send(getError(catchError.message));
    }
    return res.status(400).send(getError(catchError));
  }
});

router.post("/WhoSeenMessagesInGroup", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = chkWhoSeenInGroup(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id, message_id } = value;
    const chkGroup = await chkExistingGroup(group_id);
    if (!chkGroup) {
      return res.status(404).send(getError("No group exists"));
    }
    const getUsers = await prisma.message_reciever.findMany({
      where: {
        AND: [
          {
            group_id,
          },
          {
            seen: true,
          },
          {
            message_id,
          },
        ],
      },
      select: {
        reciever: {
          select: {
            user_id: true,
            username: true,
            profile_img: true,
            online_status: true,
            online_status_time: true,
          },
        },
      },
    });
    if (!getUsers) {
      return res.status(404).send(getError("No user found"));
    }
    return res.status(200).send(getSuccessData(getUsers));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.get("/getMyChatMates", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req?.user;
    const getMates = await prisma.user.findFirst({
      where: {
        user_id,
      },
      select: {
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
        },
      },
    });

    const reciever = getMates.primary_user_channel;
    const getReciever = reciever?.map((data) => {
      return data.reciever;
    });
    const sender = getMates.secondary_user_channel;
    const getSender = sender?.map((data) => {
      return data.sender;
    });

    const mergeBoth = [...getReciever, ...getSender];
    const sorted = _.orderBy(mergeBoth, ["created_at"], ["desc"]);
    return res.status(200).send(getSuccessData(sorted));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(error);
  }
});

module.exports = router;
