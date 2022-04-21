const { MessageType } = require("@prisma/client");
const Joi = require("joi");

function emailValidation(data) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
  });
  return emailSchema.validate(data);
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

function signUpValidation(data) {
  const signupschema = Joi.object({
    phone: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });
  return signupschema.validate(data);
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

function messageValidation(data) {
  const messageSchema = Joi.object({
    reciever_id: Joi.string().required(),
    message_type: Joi.string()
      .valid(MessageType.TEXT.toString())
      .required(),
    //   attachment: joi.when("message_type", {
    //   is: MessageType.MEDIA.toString(),
    //   then: joi.string(),
    // }),
    message_body: Joi.when("message_type", {
      is: MessageType.TEXT.toString(),
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
  });
  return messageSchema.validate(data);
};

function fetchMessageValidation(data) {
  const fetchMessageSchema = joi.object({
    reciever_id: Joi.string().required()
  });
  return fetchMessageSchema.validate(data);
};

module.exports = {
  emailValidation,
  emailPhoneAndOtpValidation,
  phoneAndOtpValidation,
  phoneValidation,
  signUpValidation,
  messageValidation,
  fetchMessageValidation
};
