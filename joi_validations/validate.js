const { MessageType,PrivacyType } = require("@prisma/client");
const Joi = require("joi");

function emailValidation(data) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
  });
  return emailSchema.validate(data);
}

function loginUser(data) {
  const loginSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
    fcm_token: Joi.string().required(),
  });
  return loginSchema.validate(data);
}

function phoneAndOtpValidation(data) {
  const phoneAndOtpSchema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.number().integer().greater(1111).less(9999).required().messages({
      "number.greater": "otp must be 4 digit number.",
      "number.less": "otp must be 4 digit number.",
    }),
  });
  return phoneAndOtpSchema.validate(data);
}

function phoneValidation(data) {
  const phoneSchema = Joi.object({
    phone: Joi.string().required(),
  });
  return phoneSchema.validate(data);
}

function changePhoneNumberSendOtpValidation(data) {
  const phoneSchema = Joi.object({
    phone: Joi.string().required(),
    old_phone: Joi.string().required(),
  });
  return phoneSchema.validate(data);
}

function changePhoneNumberValidation(data) {
  const updatePhoneSchema = Joi.object({
    old_phone: Joi.string().required(),
    phone: Joi.string().required(),
    otp: Joi.number().integer().greater(1111).less(9999).required().messages({
      "number.greater": "otp must be 4 digit number.",
      "number.less": "otp must be 4 digit number.",
    }),
  });
  return updatePhoneSchema.validate(data);
}

function signUpValidation(data) {
  const signupschema = Joi.object({
    phone: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    fcm_token: Joi.string().required(),
  });
  return signupschema.validate(data);
}

function chkUsername(data) {
  const usernameschema = Joi.object({
    user_name: Joi.string().required(),
  });
  return usernameschema.validate(data);
}

function updatePasswordValidation(data) {
  const updatePasswordSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
  });
  return updatePasswordSchema.validate(data);
}

function updateProfile(data) {
  const userProfileSchema = Joi.object({
    user_name: Joi.string(),
    about_me: Joi.string(),
    gender: Joi.string(),
    birthday: Joi.string(),
  });
  return userProfileSchema.validate(data);
}

function updatePrivacy(data) {
  const privacySchema = Joi.object({
   privacy_type: Joi.string()
   .valid(
    PrivacyType.EVERYONE.toString(),
    PrivacyType.MY_CONTACTS.toString(),
    PrivacyType.NOBODY.toString(),
   )
   .required(),
  });
  return privacySchema.validate(data);
}

function emailPhoneAndOtpValidation(data) {
  const phoneEmailAndOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/),
    otp: Joi.number().integer().greater(1111).less(9999).required().messages({
      "number.greater": "otp must be 4 digit number.",
      "number.less": "otp must be 4 digit number.",
    }),
  });
  return phoneEmailAndOtpSchema.validate(data);
}

function groupCreateValidation(data) {
  const createGroupSchema = Joi.object({
    groupDescription: Joi.string(),
    groupName: Joi.string().required(),
    member_id: Joi.array().required(),
  });
  return createGroupSchema.validate(data);
}

function updateGroupInfoValidate(data) {
  const updateGroupSchema = Joi.object({
    group_id: Joi.string().required(),
    group_name: Joi.string(),
    group_description: Joi.string(),
  });
  return updateGroupSchema.validate(data);
}

function addMembersInGroup(data) {
  const addMembersSchema = Joi.object({
    group_id: Joi.string().required(),
    member_id: Joi.array().required(),
  });
  return addMembersSchema.validate(data);
}

function removeMembersFromGroup(data) {
  const removeMembersSchema = Joi.object({
    group_id: Joi.string().required(),
    member_id: Joi.string().required(),
  });
  return removeMembersSchema.validate(data);
}

function leaveGroupValidation(data) {
  const leaveGroupSchema = Joi.object({
    group_id: Joi.string().required(),
  });
  return leaveGroupSchema.validate(data);
}

function groupMuteValidation(data){
  const groupMuteSchema = Joi.object({
    group_id: Joi.string().required(),
  });
  return groupMuteSchema.validate(data);
}

function getAllMembers(data) {
  const membersSchema = Joi.object({
    group_id: Joi.string().required(),
  });
  return membersSchema.validate(data);
}

function messageValidation(data) {
  const messageSchema = Joi.object({
    is_group_chat: Joi.boolean().required(),
    reciever_id: Joi.when("is_group_chat", {
      is: false,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    group_id: Joi.when("is_group_chat", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    message_type: Joi.string()
      .valid(
        MessageType.TEXT.toString(),
        MessageType.MEDIA.toString(),
        MessageType.LINK.toString(),
        MessageType.CONTACT.toString()
      )
      .required(),
    media: Joi.when("message_type", {
      is: MessageType.MEDIA.toString(),
      then: Joi.string(),
    }),
    media_type: Joi.when("message_type", {
      is: MessageType.MEDIA.toString(),
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    media_caption: Joi.when("message_type", {
      is: MessageType.MEDIA.toString(),
      then: Joi.string(),
    }),
    message_body: Joi.when("message_type", {
      is: MessageType.TEXT.toString(),
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    message_body: Joi.when("message_type", {
      is: MessageType.LINK.toString(),
      then: Joi.string().uri().required(),
      otherwise: Joi.string(),
    }),
    contact: Joi.when("message_type", {
      is: MessageType.CONTACT.toString(),
      then: Joi.array().required().items({
        contact_name: Joi.string().required(),
        contact_number: Joi.string().required(),
      }),
      otherwise: Joi.string(),
    }),
  });
  return messageSchema.validate(data);
}

function fetchMessageValidation(data) {
  const groupChatChkSchema = Joi.object({
    is_group_chat: Joi.boolean().required(),
    page: Joi.number().integer(),
    reciever_id: Joi.when("is_group_chat", {
      is: false,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    group_id: Joi.when("is_group_chat", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
  });
  return groupChatChkSchema.validate(data);
}

function seenMessagesValidation(data) {
  const seenMessagesSchema = Joi.object({
    sender_id: Joi.string().required(),
  });
  return seenMessagesSchema.validate(data);
}

function groupMessageSeen(data) {
  const seenSchema = Joi.object({
    group_id: Joi.string().required(),
  });
  return seenSchema.validate(data);
}

function chkWhoSeenInGroup(data) {
  const seenSchema = (chkSeenBySchema = Joi.object({
    group_id: Joi.string().required(),
    message_id: Joi.string().required(),
  }));
  return seenSchema.validate(data);
}

function blockUserValidation(data) {
  const blockSchema = Joi.object({
    blocker_id: Joi.string().required(),
  });
  return blockSchema.validate(data);
}

function reportuserValidation(data){
  const reportUserSchema = Joi.object({
    reported_id: Joi.string().required(),
    report_reason: Joi.string().required(),
  });
  return reportUserSchema.validate(data);
}

function reportGroupValidation(data){
  const reportGroupSchema = Joi.object({
    report_reason: Joi.string().required(),
    group_id: Joi.string().required(),
  });
  return reportGroupSchema.validate(data);
}



module.exports = {
  emailValidation,
  chkUsername,
  loginUser,
  emailPhoneAndOtpValidation,
  phoneAndOtpValidation,
  phoneValidation,
  signUpValidation,
  messageValidation,
  fetchMessageValidation,
  seenMessagesValidation,
  updatePasswordValidation,
  groupCreateValidation,
  addMembersInGroup,
  getAllMembers,
  removeMembersFromGroup,
  groupMessageSeen,
  chkWhoSeenInGroup,
  updateProfile,
  changePhoneNumberSendOtpValidation,
  changePhoneNumberValidation,
  leaveGroupValidation,
  blockUserValidation,
  updateGroupInfoValidate,
  reportGroupValidation,
  reportuserValidation,
  groupMuteValidation,
  updatePrivacy,
};
