const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  signUpValidation,
  checkEmailValidation,
  referalIdValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteSingleImage,
  clean,
} = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
const imagemulter = require("../middleWares/imageMulter");

// SIMPLE SIGNUP USER
router.post("/UpdatePassword", [trimRequest.all], async (req, res) => {
  try {
    if (!req.body.phone) {
      return res.status(404).send(getError("please send phone number"));
    }
    if (!req.body.password) {
      return res.status(404).send(getError("please send password"));
    }
    const phone = "+" + clean(req.body.phone);
    const chkphone = await getUserFromphone(phone);
    if (!chkphone) {
      return res.status(404).send(getError("phone number doest not Exist."));
    }
    if (chkphone?.Otp_verified == false) {
      return res
        .status(404)
        .send(getError("Please verify your phone number first."));
    }
    const updateuser = await prisma.user.update({
      where: {
        user_id: chkphone?.user_id,
      },
      data: {
        password: req.body.password,
      },
    });
    if (updateuser)
      return res
        .status(200)
        .send(getSuccessData("password updated successfully"));
    return res.status(404).send(getError("please try again"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// signUp USER //
router.post("/signUpUser", [trimRequest.all,imagemulter], async (req, res) => {
  try {
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteSingleImage(req);
      return res.status(404).send(getError(error.details[0].message));
    }
    if (req.file_error) {
      deleteSingleImage(req);
      return res.status(404).send(req.file_error);
    }
    if (!req.file) {
      deleteSingleImage(req);
      return res.status(404).send(getError("Please Select Your Profile."));
    }
    const { username: _username, password } = value;
    const phone = "+" + clean(value.phone);
    const username = _username.toLowerCase();

    const getExistingUser = await getUserFromphone(phone);
    if (getExistingUser?.Otp_verified == false) {
      deleteSingleImage(req);
      return res.status(404).send(getError("Please verify otp first"));
    }
    if (getExistingUser?.is_registered == true) {
      deleteSingleImage(req);
      return res.status(404).send(getError("This user already exists"));
    }
    if (getExistingUser?.username == username) {
      deleteSingleImage(req);
      return res.status(404).send(getError("This username already exists"));
    }

    const createUser = await prisma.user.update({
      where: {
        user_id: getExistingUser?.user_id,
      },
      data: {
        password,
        username,
        phone,
        is_registered: true,
        profile_img: req?.file?.filename,
      },
    });
    return res.status(200).send(getSuccessData(await createToken(createUser)));
  } catch (catchError) {
    deleteSingleImage(req);
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// SIMPLE LOGIN
router.post("/simpleLogin", trimRequest.all, async (req, res) => {
  console.log(req.body);
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
