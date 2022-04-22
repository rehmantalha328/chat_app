const router = require("express").Router();
const rn = require("random-number");
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
const {
  emailValidation,
  phoneAndOtpValidation,
  phoneValidation,
  emailPhoneAndOtpValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  clean,
  timeExpired,
} = require("../helper_functions/helpers");
const { send_message } = require("../twilio/twilio");

router.post("/request_phone_otp", trimRequest.all, async (req, res) => {
  const { error, value } = phoneValidation(req.body);
  if (error) return res.status(404).send(getError(error.details[0].message));
  const phone = "+" + clean(value.phone);
  // return res.send(value);
  try {
    // if (phone.startsWith("+92")) {
    //   if (phone.length != 13)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 10 character long."));
    // } else if (phone.startsWith("+234")) {
    //   if (phone.length != 14)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 10 or 11  character long."));
    // } else if (phone.startsWith("+34")) {
    //   if (phone.length != 12)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 9 or 10  character long."));
    // } else
    //   return res
    //     .status(404)
    //     .send(getError("Phone can only starts with +92 or +234."));
    const random = rn.generator({
      min: 1111,
      max: 9999,
      integer: true,
    })();
    const PhoneExists = await getUserFromphone(phone);
    if (PhoneExists) {
      if (PhoneExists.Otp_verified == true) {
        return res.status(404).send(getError("Phone number already verified"));
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
          updated_at: new Date(),
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

  // try {
  // if (phone.startsWith("+92")) {
  //   if (phone.length != 13)
  //     return res
  //       .status(404)
  //       .send(getError("Phone should be 10 character long."));
  // } else if (phone.startsWith("+234")) {
  //   if (phone.length != 14)
  //     return res
  //       .status(404)
  //       .send(getError("Phone should be 10 or 11  character long."));
  // } else if (phone.startsWith("+34")) {
  //   if (phone.length != 12)
  //     return res
  //       .status(404)
  //       .send(getError("Phone should be 9 or 10  character long."));
  // } else
  //   return res
  //     .status(404)
  //     .send(getError("Phone can only starts with +92 or +234."));
  const PhoneExists = await prisma.user.findFirst({
    where: {
      phone,
    },
  });
  if (!PhoneExists) {
    return res
      .status(404)
      .send(getError("This phone number is not registered"));
  }

  const existingOtp = await prisma.user.findFirst({
    where: {
      phone,
      // Otp: otp,
    },
  });

  // if (!existingOtp) return res.status(404).send(getError("Otp not correct"));

  // if (timeExpired({ time: existingOtp.updated_at, p_minutes: 5 })) {
  //   return res.status(404).send(getError("Otp Expired."));
  // }
  // if (timeExpired({ time: existingOtp.updated_at, p_minutes: 5 })) {
  //   return res.status(404).send(getError("Otp Expired."));
  // }
  await prisma.user.delete({
    where: {
      user_id: existingOtp.user_id,
    },
  });

  return res.status(200).send(getSuccessData("Phone successfully verified"));
  // } catch (err) {
  //   if (err && err.message) {
  //     return res.status(500).send(getError(err.message));
  //   }
  //   return res.status(500).send(getError(err));
  // }
});

router.post("/request_forgotPassword_phone_otp",
  trimRequest.all,
  async (req, res) => {
    const { error, value } = phoneValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    const phone = "+" + clean(value.phone);

    try {
      // if (phone.startsWith("+92")) {
      //   if (phone.length != 13)
      //     return res
      //       .status(404)
      //       .send(getError("Phone should be 10 character long."));
      // } else if (phone.startsWith("+234")) {
      //   if (phone.length != 14)
      //     return res
      //       .status(404)
      //       .send(getError("Phone should be 10 or 11  character long."));
      // } else if (phone.startsWith("+34")) {
      //   if (phone.length != 12)
      //     return res
      //       .status(404)
      //       .send(getError("Phone should be 9 or 10  character long."));
      // } else
      //   return res
      //     .status(404)
      //     .send(getError("Phone can only starts with +92 or +234."));
      const random = rn.generator({
        min: 1111,
        max: 9999,
        integer: true,
      })();

      const PhoneExists = await prisma.user.findFirst({
        where: {
          phone,
        },
      });
      if (PhoneExists) {
        await prisma.user.update({
          where: {
            user_id: PhoneExists.user_id,
          },
          data: {
            Otp: random,
            Otp_verified: false,
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

router.post("/forgotpassowrd_verify_phone_otp",
  trimRequest.all,
  async (req, res) => {
    const { error, value } = phoneAndOtpValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));

    const { otp } = value;
    const phone = "+" + clean(value.phone);

    // try {
    // if (phone.startsWith("+92")) {
    //   if (phone.length != 13)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 10 character long."));
    // } else if (phone.startsWith("+234")) {
    //   if (phone.length != 14)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 10 or 11  character long."));
    // } else if (phone.startsWith("+34")) {
    //   if (phone.length != 12)
    //     return res
    //       .status(404)
    //       .send(getError("Phone should be 9 or 10  character long."));
    // } else
    //   return res
    //     .status(404)
    //     .send(getError("Phone can only starts with +92 or +234."));
    const PhoneExists = await prisma.user.findFirst({
      where: {
        phone,
      },
    });
    if (!PhoneExists) {
      return res
        .status(404)
        .send(getError("This phone number is not registered"));
    }
    const existingOtp = await prisma.user.findFirst({
      where: {
        phone,
        // Otp: otp,
      },
    });

    // if (!existingOtp) return res.status(404).send(getError("Otp not correct"));

    // if (timeExpired({ time: existingOtp.updated_at, p_minutes: 5 })) {
    //   return res.status(404).send(getError("Otp Expired."));
    // }
    // if (timeExpired({ time: existingOtp.updated_at, p_minutes: 5 })) {
    //   return res.status(404).send(getError("Otp Expired."));
    // }
    await prisma.user.update({
      where: {
        user_id: PhoneExists?.user_id,
      },
      data: {
        Otp_verified: true,
      },
    });

    return res.status(200).send(getSuccessData("Phone successfully verified"));
    // } catch (err) {
    //   if (err && err.message) {
    //     return res.status(500).send(getError(err.message));
    //   }
    //   return res.status(500).send(getError(err));
    // }
  }
);



module.exports = router;
