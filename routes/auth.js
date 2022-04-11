const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const {
  signUpValidation,
  checkEmailValidation,
  referalIdValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteUploadedImage,
  clean,
} = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
// const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");

// SIMPLE SIGNUP USER
router.post("/signUpUser", [trimRequest.all], async (req, res) => {
  try {
    const { error, value } = signUpValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { username: _username, password } = value;
    const phone = "+" + clean(value.phone);
    const username = _username.toLowerCase();

    const chkusername = await chkExistingUserName(username);
    if (chkusername) {
      return res.status(404).send(getError("Username Already Taken."));
    }
    const chkphone = await getUserFromphone(phone);
    if (!chkphone) {
      return res.status(404).send(getError("phone number doest not Exist."));
    }
    if (chkphone?.Otp_verified == false) {
      return res
        .status(404)
        .send(getError("Please verify your phone number first."));
    }
    const createUser = await prisma.user.update({
      where: {
        user_id: chkphone?.user_id,
      },
      data: {
        password,
        username,
      },
    });
    return res.status(200).send(getSuccessData(await createToken(createUser)));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

router.post("/chkReferalId", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = referalIdValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { refrer_id } = value;

    const chkRefrer = await prisma.users.findFirst({
      where: {
        referal_id: refrer_id,
      },
    });
    if (!chkRefrer) {
      return res.status(404).send(getError("Invalid referal ID"));
    }
    return res.status(200).send(getSuccessData("Successfully applied"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error.message));
  }
});

// SIMPLE LOGIN
router.post("/simpleLogin", trimRequest.all, async (req, res) => {
  try {
    let username = req.body.username;
    let phone = req.body.phone;
    let password = req.body.password;
    if (!username && !phone) {
      return res
        .status(404)
        .send(getError("username or phone number required"));
    }
    if (!username && !phone) {
      return res
        .status(404)
        .send(getError("username or phone number required"));
    }
    if (!password) {
      return res.status(404).send(getError("password required"));
    }
    var finduser;
    if (phone) {
      const chkphone = await getUserFromphone(phone);
      if (!chkphone) {
        return res.status(404).send(getError("phone number incorrect"));
      }
      finduser = await prisma.user.findFirst({
        where: {
          phone,
          password,
        },
      });
    } else {
      finduser = await prisma.user.findFirst({
        where: {
          username,
          password,
        },
      });
    }
    if (!finduser) {
      return res.status(404).send(getError("Invalid Credentials"));
    }
    return res.status(200).send(getSuccessData(await createToken(finduser)));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

module.exports = router;
