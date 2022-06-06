const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  signUpValidation,
  updatePasswordValidation,
  loginUser,
  chkUsername,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteExistigImg,
  clean,
} = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUsername,
} = require("../database_queries/auth");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
const imagemulter = require("../middleWares/imageMulter");
const { fs } = require("file-system");

// SIMPLE SIGNUP USER
router.post("/UpdatePassword", [trimRequest.all], async (req, res) => {
  try {
    const { error, value } = updatePasswordValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { password } = value;
    const phone = "+" + clean(value.phone);
    const chkphone = await getUserFromphone(phone);
    if (!chkphone) {
      return res.status(404).send(getError("phone number doest not Exist."));
    }
    if (chkphone?.forgot_password_otp_verify == false) {
      return res
        .status(404)
        .send(getError("Please verify your phone number first."));
    }
    const updateuser = await prisma.user.update({
      where: {
        user_id: chkphone?.user_id,
      },
      data: {
        password,
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
router.post("/signUpUser", [trimRequest.all, imagemulter], async (req, res) => {
  try {
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteExistigImg(req);
      return res.status(404).send(getError(error.details[0].message));
    }
    if (req.file_error) {
      deleteExistigImg(req);
      return res.status(404).send(getError(req.file_error));
    }
    if (!req.file) {
      deleteExistigImg(req);
      return res.status(404).send(getError("Please Select Your Profile."));
    }
    const { username: _username, password } = value;
    const phone = "+" + clean(value.phone);
    const username = _username.toLowerCase();

    const getExistingUser = await getUserFromphone(phone);
    if (!getExistingUser) {
      deleteExistigImg(req);
      return res.status(404).send(getError("User with this phone doesn't exists"));
    }
    if (getExistingUser?.Otp_verified == false) {
      deleteExistigImg(req);
      return res.status(404).send(getError("Please verify otp first"));
    }
    if (getExistingUser?.is_registered == true) {
      deleteExistigImg(req);
      return res.status(404).send(getError("This user already exists"));
    }

    // s3 bucket for profile
    if (req?.file) {
      const file = req?.file;
      let { Location } = await uploadFile(file);
      var profile_picture = Location;
    }
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // END

    const createUser = await prisma.user.update({
      where: {
        user_id: getExistingUser?.user_id,
      },
      data: {
        password,
        username,
        is_registered: true,
        profile_img: profile_picture,
      },
    });
    if (!createUser) {
      deleteExistigImg(req);
      deleteFile(profile_picture);
      return res
        .status(404)
        .send(getError("There is some issue please try again later"));
    }
    return res.status(200).send(getSuccessData(await createToken(createUser)));
  } catch (catchError) {
    deleteFile(profile_picture);
    deleteExistigImg(req);
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// SIMPLE LOGIN
router.post("/simpleLogin", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = loginUser(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { password } = value;
    const phone = "+" + clean(value.phone);
    const getExistingUser = await getUserFromphone(phone);
    if (!getExistingUser) {
      return res.status(404).send(getError("Invalid phone or password"));
    }
    if (getExistingUser?.phone !== phone) {
      return res.status(404).send(getError("Phone number is incorrect"));
    }
    if (getExistingUser?.password !== password) {
      return res.status(404).send(getError("Passwword is incorrect"));
    }
    return res
      .status(200)
      .send(getSuccessData(await createToken(getExistingUser)));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

module.exports = router;
