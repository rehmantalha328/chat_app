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
  leaveGroupValidation,
  updateGroupInfoValidate,
  groupMuteValidation,
  deleteChatValidation,
} = require("../joi_validations/validate");
const {
  chkMessageChannel,
  createMessageChannel,
  chkExistingGroup,
  chkAdmin,
  chkExistingMember,
} = require("../database_queries/chat");
const {
  isNotificationAllowed,
  isPrivateChatNotificationAllowed,
  isGroupChatNotificationAllowed,
  isGroupMuteFalse,
} = require("../database_queries/notifications");
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
  sendContactMessage,
  sendContactMessageToGroup,
  seenMessages,
  muteSpecificChatNotification,
  globallyMutePrivateChat,
  globallyMuteGroupChat,
} = require("../socket/socket");
const imagemulter = require("../middleWares/imageMulter");
const mediaMulter = require("../middleWares/media");
const { fs } = require("file-system");
const {
  uploadFile,
  deleteFile,
  uploadThumbnail,
} = require("../s3_bucket/s3_bucket");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { v4 } = require("uuid");
const { SendNotification } = require("../notifications/pushNotifications");

// Create Group
router.post(
  "/createGroup",
  [imagemulter, trimRequest.all],
  async (req, res) => {
    try {
      const group_creator_id = req?.user?.user_id;
      // All code here
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

// Update group info
router.post(
  "/updateGroupInfo",
  [trimRequest.all, imagemulter],
  async (req, res) => {
    try {
      const admin_id = req.user.user_id;
      // All code here
      return res
        .status(200)
        .send(getSuccessData("Group info updated successfully"));
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// Fetch all members in group
router.post("/getMembersInGroup", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = getAllMembers(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { group_id } = value;
    // Code goes here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// Add members in the group
router.post("/addMembersInGroup", trimRequest.all, async (req, res) => {
  try {
    // Code here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(error.message);
    }
    return res.status(404).send(error);
  }
});

// Remove members from group
router.post("/removeMembersFromGroup", trimRequest.all, async (req, res) => {
  try {
    // Code here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// Leave group
router.post("/leaveGroup", trimRequest.all, async (req, res) => {
  try {
    // Code Here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// Mute Notification for all private and group chats specifically
router.post(
  "/mute_specific_group_and_private_chat",
  trimRequest.all,
  async (req, res) => {
    try {
      // Code goes here
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// Mute Notifications for private chat globally
router.post(
  "/mute_notifications_for_all_private_chats",
  trimRequest.all,
  async (req, res) => {
    try {
    // Code here
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// Mute Notifications for group chat globally
router.post(
  "/mute_notifications_for_all_group_chats",
  trimRequest.all,
  async (req, res) => {
    try {
      // Code here
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// Fetch my chat


module.exports = router;
