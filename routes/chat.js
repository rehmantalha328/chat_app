const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
var _ = require("lodash");
const { MessageType } = require("@prisma/client");
const {
  messageValidation,
  fetchMessageValidation,
  seenMessagesValidation,
} = require("../joi_validations/validate");
const {
  chkMessageChannel,
  createMessageChannel,
} = require("../database_queries/chat");
const { getUserFromId } = require("../database_queries/auth");
const { getError, getSuccessData } = require("../helper_functions/helpers");
const { sendMessageToGroup, sendTextMessage } = require("../socket/socket");
// const { uuid } = require('uuid');


router.post("/createGroup", trimRequest.all, async (req, res) => {
  try {
    let group_creator_id = req?.user?.user_id;
    let groupDescription = req?.body?.groupDescription;
    let groupName = req?.body?.groupName;
    let is_group_chat = true;
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
        group_creator_id,
        group_description: groupDescription,
        group_name: groupName,
        is_group_chat,
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
        member_id: group_creator_id,
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
  let sender_name = req?.user?.username;
  let group_id = req.body.group_id;
  let message = req.body.message;
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
  const updateLastMessage = await prisma.groups.update({
    where: {
      group_id,
    },
    data: {
      last_message: message,
      last_message_time: new Date(),
      last_message_id: createMessage?.id,
      last_message_from: sender_name,
    },
  });
  sendMessageToGroup(sender_id, reciever, message);
  return res.status(200).send(getSuccessData(createMessage));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.get("/fetchMygroups", trimRequest.all, async (req, res) => {
  try {
  let user_id = req.user.user_id;
  const getMyGroups = await prisma.group_members.findMany({
    where: {
      member_id: user_id,
    },
    include: {
      group: {
        include: {
          // group_creator: {
          //   select: {
          //     user_id: true,
          //     username: true,
          //     phone: true,
          //   },
          // },
          last_message_sender: {
            select: {
              user_id: true,
              username: true,
              phone: true,
              profile_img: true,
            },
          },
          sender: {
            select: {
              user_id: true,
              username: true,
              phone: true,
              profile_img: true,
            },
          },
          reciever: {
            select: {
              user_id: true,
              username: true,
              phone: true,
              profile_img: true,
            },
          },
          messages: {
            select: {
              media:true,
              message_body:true,
              message_id:true,
              message_type:true,
            }
          },
          // group_members: {
          //   select: {
          //     is_admin: true,
          //     member: {
          //       select: {
          //         user_id: true,
          //         username: true,
          //         phone: true,
          //       },
          //     },
          //   },
          // },
          
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
        },
      },
    },
    orderBy: {
      created_at:'desc',
    }
  });
    
  //   let newArray = [];
  //   let groups = [];
  //   getMyGroups?.forEach((data) => {
  //     groups.push(data?.group);
  //   data?.group?.groupMessages?.forEach((data) => {
  //     data?.reciver?.forEach((data) => {
  //       newArray.push(data);
  //     });
  //   });
  // });

  // let unseenCounter = 0;
  // for (let i = 0; i < newArray?.length; i++) {
  //   if (newArray[i]?.reciever_id === user_id && newArray[i]?.seen === false) {
  //     unseenCounter++;
  //   }
  // }
    return res.send(getSuccessData(groups));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.get("/fetchMyMessages", trimRequest.all, async (req, res) => {
  let user_id = req.user.user_id;
  let group_id = req?.body?.group_id;
  // const getMyGroups = await prisma.group_messages.findMany({
  //   where: {
  //     OR: [
  //       {
  //         sender_id: user_id,
  //       },
  //       {
  //         reciver: {
  //           some: {
  //             reciever_id: user_id,
  //           },
  //         },
  //       },
  //     ],
  //   },
  //   orderBy: {
  //     created_at: "desc",
  //   },
  // });
  const getGroupMessages = await prisma.groups.findFirst({
    where: {
      group_id,
    },
    include: {
      groupMessages: {
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
      },
    },
  });
  return res.send(getSuccessData(getMyGroups));
});

router.post("/seen_messages_in_group", trimRequest.all, async (req, res) => {
  try {
    let reciever_id = req?.user?.user_id;
    // const findMesages = await prisma.group_messages.findMany({
    //   where: {
    //     reciver: {
    //       some: {
    //         reciever_id,
    //         seen: false,
    //       },
    //     }
    //   },
    //   select: {
    //     message_body: true,
    //     attatchment: true,
    //     message_type: true,
    //     id: true,
    //   }
    // });
    const seen = await prisma.message_reciever.updateMany({
      where: {
        reciever_id,
        seen: false,
      },
      data: {
        seen: true,
      }
    })
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
  
});

router.post("/sendMessages", trimRequest.all, async (req, res) => {
  try { 
  let sender_id = req.user.user_id;
  let sender_name = req?.user?.username;
  let is_group_chat = req?.body?.is_group_chat;

  if (is_group_chat === true) {
    let group_id = req?.body?.group_id;
    let message_body = req?.body?.message_body;
    let message_type = req?.body?.message_type;
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
        message_body,
        message_type,
      },
    });
    const updateLastMessage = await prisma.groups.update({
      where: {
        group_id,
      },
      data: {
        last_message: message_body,
        last_message_time: new Date(),
        last_message_id: createMessage?.id,
        last_message_sender: sender_name,
        last_message_sender_id: sender_id,
      },
    });
    sendMessageToGroup(sender_id, reciever, message_body);
    return res.status(200).send(getSuccessData(createMessage));
  }
  else {
    // const { fname, lname, profile_picture } = req.user;
    // let files = [];
    // let media = [];
    const { error, value } = messageValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    // if (req.file_error) {
    //   deleteUploadedImage(req);
    //   return res.status(404).send(getError(req.file_error));
    // }
    let { reciever_id, message_body, message_type } = value;

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
    if (message_type === MessageType.TEXT) {
      // files = null;
      // deleteUploadedImage(req);
      const createMessage = await prisma.group_messages.create({
        data: {
          sender_id,
          reciever_id,
          group_id: chkChannel
            ? chkChannel.group_id
            : chkChannel.group_id,
          message_body,
          message_type,
        },
      });
      sendTextMessage(sender_id, reciever_id, message_body, message_type);
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
  }
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

router.post("/fetch_messages", trimRequest.all, async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const { error, value } = fetchMessageValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { reciever_id } = value;
    const getChannel = await prisma.messages_Channel.findFirst({
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
    if (!getChannel) {
      return res.status(404).send(getError("No channel Exist"));
    }
    const getMessage = await prisma.messages_Channel.findFirst({
      where: {
        channel_id: getChannel.channel_id,
      },
      select: {
        channel_messages: true,
      },
    });

    const get = getMessage.channel_messages;
    const msgs = _.orderBy(get, ["created_at"], ["asc"]);
    return res.status(200).send(getSuccessData(msgs));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

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
                // online_status: true,
                // online_status_time: true,
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
                // online_status: true,
                // online_status_time: true,
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
            last_message: true,
            last_message_time: true,
            last_message_id: true,
            last_message_sender: true,
            last_message_sender_id: true,
            is_group_chat: true,
            group_messages: {
              orderBy: {
                created_at:'desc',
              }
            },
          },
          orderBy: {
            created_at:'desc',
          }
        },
        groups_i_joined: {
          where: {
            OR: [{
              is_admin: false,
            }, {
              is_sub_admin: true,
            }]
          },
          select: {
            group: {
              select: {
                group_name: true,
                group_id: true,
                group_image: true,
                group_description: true,
                last_message: true,
                last_message_time: true,
                last_message_id: true,
                last_message_sender: true,
                last_message_sender_id: true,
                is_group_chat: true,
                group_messages: {
                  orderBy: {
                    created_at:'desc',
                  }
                }
              }
            }
          },
          orderBy: {
            created_at: 'desc',
          }
        }
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
        arr.group_messages.length > 0
          ? arr.group_messages[0].created_at
          : null;
      obj.un_seen_counter = arr.group_messages.filter(
        (ar) => ar.seen === false && ar.reciever_id === user_id
      ).length;
      obj.is_group_chat = false;
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
        ary.group_messages.length > 0
          ? ary.group_messages[0].created_at
          : null;
      obj.un_seen_counter = ary.group_messages.filter(
        (ar) => ar.seen === false && ar.reciever_id === user_id
      ).length;
      obj.is_group_chat = false;
      return obj;
    });

    const my_created_groups = contacts.groups_i_created;
    const fourth = contacts.groups_i_joined;
    
    const my_joined_groups = [];
    const chk = fourth?.forEach((ary) => {
      my_joined_groups.push({
        group_name: ary?.group?.group_name,
        group_id: ary?.group?.group_id,
        group_image: ary?.group?.group_image,
        group_description: ary?.group?.group_description,
        last_message: ary?.group?.last_message,
        last_message_time: ary?.group?.last_message_time,
        last_message_id: ary?.group?.last_message_id,
        last_message_sender: ary?.group?.last_message_sender,
        last_message_sender_id: ary?.group?.last_message_sender_id,
        is_group_chat: ary?.group?.is_group_chat,
       })
    });
    
    const friend = [...send, ...recieve, ...my_created_groups, ...my_joined_groups];
    console.log(friend);
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
    const message_id = await prisma.messages.findMany({
      where: {
        sender_id,
        reciever_id,
        seen: false,
      },
      select: {
        message_id: true,
      },
    });
    const is_seen = await prisma.messages.updateMany({
      where: {
        sender_id,
        reciever_id,
      },
      data: {
        seen: true,
      },
    });
    if (is_seen.count <= 0) {
      return res.status(400).send(getError("No data found"));
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

module.exports = router;
