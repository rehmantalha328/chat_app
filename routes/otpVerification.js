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
  emailValidation,
  phoneAndOtpValidation,
  phoneValidation,
  emailPhoneAndOtpValidation,
  updateProfile,
  changePhoneNumberValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  clean,
  timeExpired,
} = require("../helper_functions/helpers");
const { send_message } = require("../twilio/twilio");

router.post("/request_phone_otp", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = phoneValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    const phone = "+" + clean(value.phone);
    const random = rn.generator({
      min: 1111,
      max: 9999,
      integer: true,
    })();
    const PhoneExists = await getUserFromphone(phone);
    if (PhoneExists) {
      if (
        PhoneExists.Otp_verified == true &&
        PhoneExists.is_registered == true
      ) {
        return res.status(404).send(getError("Phone number already exists"));
      } else {
        await prisma.user.update({
          where: {
            user_id: PhoneExists.user_id,
          },
          data: {
            Otp: random,
            phone,
          },
        });
      }
    } else {
      await prisma.user.create({
        data: {
          Otp: random,
          phone,
        },
      });
    }
    const messageSent = await send_message({
      body: `Dear user, Your otp is ${random}, which is valid only for 5 minutes.`,
      number: phone,
    });
    if (messageSent) {
      return res
        .status(200)
        .send(
          getSuccessData(
            "Otp sent to your phone, which is valid only for 5 minutes"
          )
        );
    } else {
      return res.status(404).send(getError("Please try again"));
    }
  } catch (err) {
    if (err && err.message) {
      return res.status(500).send(getError(err.message));
    }
    return res.status(500).send(getError(err));
  }
});

router.post("/verify_phone_otp", trimRequest.all, async (req, res) => {
  const { error, value } = phoneAndOtpValidation(req.body);
  if (error) return res.status(404).send(getError(error.details[0].message));
  const { otp } = value;
  const phone = "+" + clean(value.phone);

  try {
    const PhoneExists = await getUserFromphone(phone);
    if (!PhoneExists) {
      return res
        .status(404)
        .send(getError("No otp issued on this phone number"));
    }
    if (
      PhoneExists?.Otp_verified == true &&
      PhoneExists?.is_registered == true
    ) {
      return res
        .status(404)
        .send(getError("This phone number is already verified"));
    }
    const chkOtpExists = await chkExistingOtp(phone, otp);
    if (!chkOtpExists) {
      return res.status(404).send(getError("Invalid otp code"));
    }
    await prisma.user.update({
      where: {
        user_id: PhoneExists?.user_id,
      },
      data: {
        Otp_verified: true,
      },
    });
    return res.status(200).send(getSuccessData("Phone successfully verified"));
  } catch (err) {
    if (err && err.message) {
      return res.status(500).send(getError(err.message));
    }
    return res.status(500).send(getError(err));
  }
});

router.post(
  "/request_forgotPassword_phone_otp",
  trimRequest.all,
  async (req, res) => {
    const { error, value } = phoneValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    const phone = "+" + clean(value.phone);

    try {
      const random = rn.generator({
        min: 1111,
        max: 9999,
        integer: true,
      })();

      const PhoneExists = await getUserFromphone(phone);
      if (
        PhoneExists.Otp_verified == true &&
        PhoneExists?.is_registered == true
      ) {
        if (PhoneExists?.forgot_password_otp_verify == false) {
          await prisma.user.update({
            where: {
              user_id: PhoneExists.user_id,
            },
            data: {
              Otp: random,
            },
          });
        }
        await prisma.user.update({
          where: {
            user_id: PhoneExists.user_id,
          },
          data: {
            Otp: random,
            forgot_password_otp_verify: false,
          },
        });
      } else {
        return res.status(404).send(getError("Phone number doesn't exist"));
      }
      const messageSent = await send_message({
        body: `Dear user, Your otp is ${random}, which is valid only for 5 minutes.`,
        number: phone,
      });
      if (messageSent) {
        return res
          .status(200)
          .send(
            getSuccessData(
              "Otp sent to your phone, which is valid only for 5 minutes"
            )
          );
      } else {
        return res.status(404).send(getError("Please try again"));
      }
    } catch (err) {
      if (err && err.message) {
        return res.status(500).send(getError(err.message));
      }
      return res.status(500).send(getError(err));
    }
  }
);

router.post(
  "/forgotpassowrd_verify_phone_otp",
  trimRequest.all,
  async (req, res) => {
    try {
      const { error, value } = phoneAndOtpValidation(req.body);
      if (error)
        return res.status(404).send(getError(error.details[0].message));
      const { otp } = value;
      const phone = "+" + clean(value.phone);
      const PhoneExists = await getUserFromphone(phone);
      if (
        !PhoneExists &&
        !PhoneExists.Otp_verified == true &&
        !PhoneExists.is_registered == true
      ) {
        return res
          .status(404)
          .send(getError("This phone number is not registered"));
      }
      const existingOtp = await chkExistingOtp(phone, otp);
      if (!existingOtp) {
        return res.status(404).send(getError("Otp doesn't match"));
      }
      await prisma.user.update({
        where: {
          user_id: PhoneExists?.user_id,
        },
        data: {
          forgot_password_otp_verify: true,
        },
      });
      return res
        .status(200)
        .send(getSuccessData("Phone successfully verified"));
    } catch (err) {
      if (err && err.message) {
        return res.status(500).send(getError(err.message));
      }
      return res.status(500).send(getError(err));
    }
  }
);



module.exports = router;
