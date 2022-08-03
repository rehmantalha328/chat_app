const { MessageType, PrivacyType } = require("@prisma/client");
const Joi = require("joi");

function emailValidation(data) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
  });
  return emailSchema.validate(data);
}

function blockUserByAdminValidate(data){
  const blockUserSchema = Joi.object({
    user_id: Joi.string().required(),
  });
  return blockUserSchema.validate(data);
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


module.exports = {
  emailValidation,
  loginUser,
  phoneAndOtpValidation,
  blockUserByAdminValidate,
};
