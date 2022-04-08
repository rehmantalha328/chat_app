const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const {
  signUpValidation,
  simpleLoginValidation,
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
const { getUserFromphone } = require("../database_queries/auth");
const uploadImage = require("../middlewares/imageMulter");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
const { AdminApproval, AccountTypes } = require("@prisma/client");

// SIMPLE SIGNUP USER
router.post("/signUpUser", [trimRequest.all], async (req, res) => {
  try {
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteUploadedImage(req);
      return res.status(404).send(getError(error.details[0].message));
    }

    const { username, password } = value;
    const phone = "+" + clean(value.phone);

    // Converting Value to lower case
    const username = username.toLowerCase();

    const chkusername = await getUserFromphone(username);
    if (!chkusername) {
      return res.status(404).send(getError("Email doest not Exist."));
    }
    if (chkusername.is_registered == true) {
      return res.status(404).send(getError("Email already taken."));
    }

    // END
    const createUser = await prisma.user.update({
      where: {
        phone: chkusername.phone,
      },
      data: {
        password,
        username,
      },
    });
    if (createUser) {
      console.log("user created:::", createUser);
      return res
        .status(200)
        .send(getSuccessData(await createToken(createUser)));
    } else {
      return res
        .status(404)
        .send(
          getError("There is some issue from server please try again later.")
        );
    }
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
    const { error, value } = simpleLoginValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    const { email: _email, password, fcm_token } = value;
    const email = _email.toLowerCase();
    const chkEmail = await getUserFromEmail(email);
    if (chkEmail?.admin_approval === AdminApproval.PENDING) {
      return res.status(404).send(getError("Please wait to approved!"));
    }
    if (chkEmail?.admin_approval === AdminApproval.BLOCKED) {
      return res
        .status(404)
        .send(getError("Sorry.. you are blocked by admin!"));
    }
    if (chkEmail?.logged_in_service == "SOCIAL")
      return res.status(404).send(getError("Email already taken."));
    if (chkEmail?.is_registered != true || chkEmail?.user_email != email) {
      return res.status(404).send(getError("Email does not exist"));
    }
    if (chkEmail.user_password != password) {
      return res.status(404).send(getError("Invalid Password"));
    }
    const updateFcmToken = await prisma.users.update({
      where: {
        user_id: chkEmail.user_id,
      },
      data: {
        fcm_token,
      },
    });
    const user = chkEmail;
    return res.status(200).send(getSuccessData(await createToken(user)));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

module.exports = router;
