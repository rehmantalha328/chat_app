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

module.exports = {
  emailValidation,
  emailPhoneAndOtpValidation,
  phoneAndOtpValidation,
  phoneValidation,
  signUpValidation,
};
