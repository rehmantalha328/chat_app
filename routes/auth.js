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
  deleteUploadedGalleryOrProfile,
} = require("../helper_functions/helpers");
const {
  getUserFromphone,
  updateFcmToken,
} = require("../database_queries/auth");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
const imagemulter = require("../middleWares/profile_gallery_multer");
const { fs } = require("file-system");
const { GroupType } = require("@prisma/client");

// Update user password after verification of otp
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

// Get all suggested groups at the time of signup
router.post("/getGroups", trimRequest.all, async (req, res) => {
  try {
    const membersMinLength = 2;
    const minGroupMessageLength = 2;
    const groups = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const getAllGroups = await prisma.groups.findMany({
      where: {
        is_group_chat: true,
        last_message_time: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        group_members: true,
        group_messages: true,
      },
    });
    const allGroups = getAllGroups?.filter(
      (data) => data.group_type !== GroupType.OFFICIAL
    );
    allGroups.forEach((data) => {
      groups.push({
        allGroupData: data,
      });
    });
    const getSortedGroups = groups.filter(
      (data) =>
        data.allGroupData.group_members.length >= membersMinLength &&
        data.allGroupData.group_messages.length >= minGroupMessageLength
    );
    getSortedGroups?.forEach((data) => {
      // delete data.allGroupData.group_members;
      delete data.allGroupData.group_messages;
    });
    if (getSortedGroups?.length <= 0) {
      return res.status(200).send(getSuccessData(getSortedGroups));
    }
    return res.status(200).send(getSuccessData(getSortedGroups));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// signUp USER //
router.post("/signUpUser", [trimRequest.all, imagemulter], async (req, res) => {
  try {
    console.log("req.body",req.body);
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError(error.details[0].message));
    }
    if (req.file_error) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError(req.file_error));
    }
    const { username: _username, password, fcm_token, about_me } = value;
    const groups = [];

    const phone = "+" + clean(value.phone);
    const username = _username.toLowerCase();
    const gallery = [];
    const getExistingUser = await getUserFromphone(phone);
    if (!getExistingUser) {
      deleteUploadedGalleryOrProfile(req);
      return res
        .status(404)
        .send(getError("User with this phone doesn't exists"));
    }
    if (getExistingUser?.Otp_verified == false) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError("Please verify otp first"));
    }
    if (getExistingUser?.is_registered == true) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError("This user already exists"));
    }

    // s3 bucket for profile
    // if (req?.files?.["profile"]) {
    //   for (const file of req.files["profile"]) {
    //     let { Location } = await uploadFile(file);
    //     var profile_picture = Location;
    //     if (fs.existsSync(file.path)) {
    //       fs.unlinkSync(file.path);
    //     }
    //   }
    // }
    // END
    // s3 bucket for gallery
    if (req?.files?.["gallery"]) {
      for (const file of req.files["gallery"]) {
        let { Location } = await uploadFile(file);
        var picture_url = Location;
        gallery.push({
          picture_url,
        });
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    // END

    const createUser = await prisma.user.update({
      where: {
        user_id: getExistingUser?.user_id,
      },
      data: {
        password,
        username,
        about_me,
        is_registered: true,
        fcm_token,
        my_gallery_pictures: {
          createMany: {
            data: gallery,
          },
        },
      },
    });
    // Find Official Defigram group
    const newsGroup = await prisma.groups.findFirst({
      where: {
        group_type: GroupType.OFFICIAL,
      },
    });
    // Add user in official group of defigram by default
    const adUserToNewsChannel = await prisma.group_members.create({
      data: {
        member_id: createUser?.user_id,
        group_id: newsGroup?.group_id,
      },
    });
    // Section for adding in suggested groups while creating account
    if (req?.body?.group_ids) {
      console.log(req.body.group_ids);
      req.body.group_ids?.forEach((data) => {
        groups.push({
          member_id: createUser?.user_id,
          group_id: data,
        });
      });
    }
    const addToGroups = await prisma.group_members.createMany({
      data: groups,
    });

    if (!createUser) {
      deleteUploadedGalleryOrProfile(req);
      return res
        .status(404)
        .send(getError("There is some issue please try again later"));
    }
    return res.status(200).send(getSuccessData(await createToken(createUser)));
  } catch (catchError) {
    deleteUploadedGalleryOrProfile(req);
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
    const { password, fcm_token } = value;
    const phone = "+" + clean(value.phone);
    const getExistingUser = await getUserFromphone(phone);
    if (!getExistingUser) {
      return res.status(404).send(getError("Invalid phone or password"));
    }
    if (getExistingUser?.phone !== phone) {
      return res.status(404).send(getError("Phone number is incorrect"));
    }
    if (getExistingUser?.password !== password) {
      return res.status(404).send(getError("Password is incorrect"));
    }
    const updateFcm = await updateFcmToken(getExistingUser?.user_id, fcm_token);
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
