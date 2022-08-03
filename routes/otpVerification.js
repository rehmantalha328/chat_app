const router = require("express").Router();
const rn = require("random-number");
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  getUserFromphone,
  chkExistingOtp,
} = require("../database_queries/auth");
const {
  phoneAndOtpValidation,
  phoneValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  clean,
} = require("../helper_functions/helpers");
const { send_message } = require("../twilio/twilio");

// Send otp on phone for registration process
router.post("/request_phone_otp", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = phoneValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    // code goes here
  } catch (err) {
    if (err && err.message) {
      return res.status(500).send(getError(err.message));
    }
    return res.status(500).send(getError(err));
  }
});

// Verify registration for signup process
router.post("/verify_phone_otp", trimRequest.all, async (req, res) => {
  const { error, value } = phoneAndOtpValidation(req.body);
  if (error) return res.status(404).send(getError(error.details[0].message));
  const { otp } = value;
  const phone = "+" + clean(value.phone);

  try {
    // Code here
  } catch (err) {
    if (err && err.message) {
      return res.status(500).send(getError(err.message));
    }
    return res.status(500).send(getError(err));
  }
});

 

module.exports = router;
