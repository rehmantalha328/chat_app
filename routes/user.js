const router = require("express").Router();
const rn = require("random-number");
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  chkUsername,
  updateProfile,
  changePhoneNumberValidation,
  changePhoneNumberSendOtpValidation,
  blockUserValidation,
  reportuserValidation,
  updatePrivacy,
  deleteGalleryImagesValidation,
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
  chkExistingUsername,
  getUserFromId,
} = require("../database_queries/auth");
const imageMulter = require("../middleWares/profile_gallery_multer");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
const { fs } = require("file-system");
const {
  blockUser,
  chkIsAlreadyBlocked,
  chkIsAlreadyReported,
  reportUser,
  unblockUser,
} = require("../database_queries/blockUsers");
const { PrivacyType } = require("@prisma/client");
const { send_message } = require("../twilio/twilio");

// Check username available or already registered
router.post("/chkUsername", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = chkUsername(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { user_name: _user_name } = value;
    const user_name = _user_name.toLowerCase();
    const getExistingUser = await chkExistingUsername(user_name);
    if (getExistingUser) {
      return res.status(404).send(getError("This username exists"));
    }
    return res.status(200).send(getSuccessData("This username is available"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// Get my profile data
router.get("/getMyProfile", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const getMyProfile = await prisma.user.findFirst({
      where: {
        user_id,
      },
      select: {
        user_id: true,
        user_name: true,
        username: true,
        profile_img: true,
        my_gallery_pictures: {
          select: {
            id: true,
            picture_url: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
        is_group_chat_notifications: true,
        is_private_chat_notifications: true,
        notifications: true,
        phone: true,
        about_me: true,
        birthday: true,
        gender: true,
        last_seen_show_to: true,
        profile_image_show_to: true,
        my_about_show_to: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!getMyProfile) {
      return res.status(404).send(getError("No data found"));
    }
    return res.status(200).send(getSuccessData(getMyProfile));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// Upload gallery images
router.post(
  "/uploadGalleryImages",
  [imageMulter, trimRequest.all],
  async (req, res) => {
    try {
      const { user_id } = req.user;
      const gallery = [];
      if (req.file_error) {
        deleteUploadedGalleryOrProfile(req);
        return res.status(404).send(getError(req.file_error));
      }
      if (req.files["gallery"]?.length <= 0) {
        deleteUploadedGalleryOrProfile(req);
        return res
          .status(404)
          .send(getError("Please select atleast one picture"));
      }
      const getMyGalleryImages = await prisma.user.findMany({
        where: {
          user_id,
        },
        select: {
          _count: {
            select: {
              my_gallery_pictures,
            },
          },
        },
      });
      const uploadedImages = getMyGalleryImages[0]?._count.my_gallery_pictures;
      const limit = 5;
      const remainingImages = limit - uploadedImages;
      const comingImages = req.files["gallery"]?.length;
      const allowedImages = uploadedImages + comingImages;
      if (allowedImages > 5) {
        return res
          .status(404)
          .send(
            getError(
              `You have uploaded ${uploadedImages} images and your remaining images is ${remainingImages}`
            )
          );
      }
      if (req?.files?.["gallery"]) {
        for (const file of req.files["gallery"]) {
          if (file) {
            const { Location } = await uploadFile(file);
            const picture_url = Location;
            gallery.push({
              picture_url,
              user_id,
            });
          }
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      const addGallery = await prisma.user_gallery.createMany({
        data: gallery,
      });
      if (addGallery?.count > 0) {
        return res.status(200).send(getSuccessData("Uploaded successful"));
      }
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// Delete gallery Images
router.post("deletGalleryImages", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { error, value } = deleteGalleryImagesValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { image_id } = value;
    const fetchMyUploadedImage = await prisma.user_gallery.findFirst({
      where: {
        id: image_id,
        user_id,
      },
      select: {
        picture_url: true,
      },
    });
    if (!fetchMyUploadedImage) {
      return res.status(404).send(getError("No picture found with this id"));
    }
    if (fetchMyUploadedImage.picture_url) {
      await deleteFile(fetchMyUploadedImage?.picture_url);
    }
    await prisma.user_gallery.delete({
      where: {
        id: image_id,
      },
    });
    return res.status(200).send(getSuccessData("Successfully delete"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// update User profile info
router.post(
  "/updateUserProfile",
  [imageMulter, trimRequest.all],
  async (req, res) => {
    try {
      const { user_id } = req.user;
      const myPrevImage = req.user.profile_img;
      const { error, value } = updateProfile(req.body);
      if (error) {
        return res.status(404).send(getError(error.details[0].message));
      }
      if (req.file_error) {
        deleteUploadedGalleryOrProfile(req);
        return res.status(404).send(getError(req.file_error));
      }
      const {
        user_name: _user_name,
        username: _username,
        about_me,
        gender,
        birthday,
      } = value;
      const user_name = _user_name?.toLowerCase();
      const username = _username?.toLowerCase();

      // s3 bucket for profile
      if (req?.files?.["profile"]) {
        const delPreviousImg = await deleteFile(myPrevImage);
        for (const file of req.files["profile"]) {
          let { Location } = await uploadFile(file);
          var profile_img = Location;
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      // END

      const updateUser = await prisma.user.update({
        where: {
          user_id,
        },
        data: {
          user_name,
          username,
          about_me,
          gender,
          birthday,
          profile_img,
        },
      });
      if (updateUser) {
        return res
          .status(200)
          .send(getSuccessData("Info updated successfully"));
      }
    } catch (catchError) {
      if (catchError && catchError.message) {
        return res.status(404).send(getError(catchError.message));
      }
      return res.status(404).send(getError(catchError));
    }
  }
);

// Update privacy of last_seen show to whom?
router.post("/update_last_seen_to_show", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { error, value } = updatePrivacy(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { privacy_type } = value;
    if (
      privacy_type !== PrivacyType.EVERYONE &&
      privacy_type !== PrivacyType.MY_CONTACTS &&
      privacy_type !== PrivacyType.NOBODY
    ) {
      return res
        .status(404)
        .send(
          getError(
            `only ${PrivacyType.EVERYONE}, ${PrivacyType.MY_CONTACTS} and ${PrivacyType.NOBODY} settings are allowed`
          )
        );
    }
    const updatePrivacy = await prisma.user.update({
      where: {
        user_id,
      },
      data: {
        last_seen_show_to: privacy_type,
      },
    });
    return res
      .status(200)
      .send(getSuccessData("Privacy setting updated successfully"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// update privacy for profile photo whom to show?
router.post(
  "/update_profile_picture_to_show",
  trimRequest.all,
  async (req, res) => {
    try {
      const { user_id } = req.user;
      const { error, value } = updatePrivacy(req.body);
      if (error) {
        return res.status(404).send(getError(error.details[0].message));
      }
      const { privacy_type } = value;
      if (
        privacy_type !== PrivacyType.EVERYONE &&
        privacy_type !== PrivacyType.MY_CONTACTS &&
        privacy_type !== PrivacyType.NOBODY
      ) {
        return res
          .status(404)
          .send(
            getError(
              `only ${PrivacyType.EVERYONE}, ${PrivacyType.MY_CONTACTS} and ${PrivacyType.NOBODY} settings are allowed`
            )
          );
      }
      const updatePrivacy = await prisma.user.update({
        where: {
          user_id,
        },
        data: {
          last_seen_show_to: privacy_type,
        },
      });
      return res
        .status(200)
        .send(getSuccessData("Privacy setting updated successfully"));
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getError(error));
    }
  }
);

// update privacy for about me that whom to show?
router.post("/update_about_me_to_show", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { error, value } = updatePrivacy(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { privacy_type } = value;
    if (
      privacy_type !== PrivacyType.EVERYONE &&
      privacy_type !== PrivacyType.MY_CONTACTS &&
      privacy_type !== PrivacyType.NOBODY
    ) {
      return res
        .status(404)
        .send(
          getError(
            `only ${PrivacyType.EVERYONE}, ${PrivacyType.MY_CONTACTS} and ${PrivacyType.NOBODY} settings are allowed`
          )
        );
    }
    const updatePrivacy = await prisma.user.update({
      where: {
        user_id,
      },
      data: {
        last_seen_show_to: privacy_type,
      },
    });
    return res
      .status(200)
      .send(getSuccessData("Privacy setting updated successfully"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// request_otp_for_change_number
router.post(
  "/request_otp_for_change_number",
  trimRequest.all,
  async (req, res) => {
    try {
      const { user_id, change_number_otp_verify } = req.user;
      const myNumber = req.user.phone;
      const { error, value } = changePhoneNumberSendOtpValidation(req.body);
      if (error) {
        return res.status(404).send(getError(error.details[0].message));
      }
      const old_phone = "+" + clean(value.old_phone);
      if (old_phone !== myNumber) {
        return res.status(404).send(getError("Invalid Number"));
      }
      const phone = "+" + clean(value.phone);
      if (old_phone === phone) {
        return res
          .status(404)
          .send(getError("New phone number must be different from old number"));
      }
      const getExistingNumber = await getUserFromphone(phone);
      if (getExistingNumber) {
        return res.status(404).send(getError("This number is already in use"));
      }
      const random = rn.generator({
        min: 1111,
        max: 9999,
        integer: true,
      })();
      const messageSent = await send_message({
        body: `Dear user, Your otp is ${random}, which is valid only for 5 minutes.`,
        number: phone,
      });
      if (messageSent) {
        if (change_number_otp_verify === true) {
          await prisma.user.update({
            where: {
              user_id,
            },
            data: {
              Otp: random,
              change_number_otp_verify: false,
            },
          });
        }
        await prisma.user.update({
          where: {
            user_id,
          },
          data: {
            Otp: random,
          },
        });
        return res
          .status(200)
          .send(
            getSuccessData(
              "Otp sent to your phone, which is valid only for 5 minutes"
            )
          );
      }
    } catch (error) {
      if (error && error.message) {
        return res.status(404).send(getError(error.message));
      }
      return res.status(404).send(getSuccessData(error));
    }
  }
);

// change_number_verify_phone_otp
router.post(
  "/change_number_verify_phone_otp",
  trimRequest.all,
  async (req, res) => {
    try {
      const { user_id } = req.user;
      const myNumber = req.user.phone;
      const { error, value } = changePhoneNumberValidation(req.body);
      if (error)
        return res.status(404).send(getError(error.details[0].message));
      const { otp } = value;
      const old_phone = "+" + clean(value.old_phone);
      if (old_phone !== myNumber) {
        return res.status(404).send(getError("Invalid Number"));
      }
      const phone = "+" + clean(value.phone);
      if (old_phone === phone) {
        return res
          .status(404)
          .send(getError("New phone number must be different from old number"));
      }
      const existingOtp = await chkExistingOtp(old_phone, otp);
      if (!existingOtp) {
        return res.status(404).send(getError("Otp doesn't match"));
      }
      await prisma.user.update({
        where: {
          user_id,
        },
        data: {
          phone,
        },
      });
      return res.status(200).send(getSuccessData("Phone updated successfully"));
    } catch (err) {
      if (err && err.message) {
        return res.status(500).send(getError(err.message));
      }
      return res.status(500).send(getError(err));
    }
  }
);

// Block & unblock users
router.post("/blockUser", trimRequest.all, async (req, res) => {
  try {
    const blocker_id = req.user.user_id;
    const { error, value } = blockUserValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { blocked_id } = value;
    const isUserExists = await getUserFromId(blocked_id);
    if (!isUserExists) {
      return res.status(404).send(getError("Blocked_ID doesn't exists"));
    }
    if (blocked_id === blocker_id) {
      return res
        .status(404)
        .send(getError("Actions cannot perform on same ID's"));
    }
    const isAlreadyBlocked = await chkIsAlreadyBlocked(blocker_id, blocked_id);
    if (isAlreadyBlocked) {
      const unblock = await unblockUser(isAlreadyBlocked?.id);
      return res
        .status(200)
        .send(getSuccessData("You successfully unblock the user"));
    }
    const blockProfile = await blockUser(blocker_id, blocked_id);
    return res.status(200).send(getSuccessData("User blocked successfully"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// Get my blocked users list
router.get("/getMyBlockedOnes", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const getMyBlockedUsers = await prisma.user.findFirst({
      where: {
        user_id,
      },
      select: {
        user_i_block: {
          select: {
            blocked: {
              select: {
                user_id: true,
                username: true,
                user_name: true,
                profile_img: true,
                created_at: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });
    return res.status(200).send(getSuccessData(getMyBlockedUsers));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

// Report User
router.post("/reportUser", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { error, value } = reportuserValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { reported_id, report_reason } = value;
    const isUserExists = await getUserFromId(reported_id);
    if (!isUserExists) {
      return res.status(404).send(getError("No user found"));
    }
    const chkIsExistsReport = await chkIsAlreadyReported(user_id, reported_id);
    if (chkIsExistsReport) {
      return res
        .status(404)
        .send(getError("You have already reported this user"));
    }
    const createReport = await reportUser(user_id, reported_id, report_reason);
    return res.status(200).send(getSuccessData("User reported successfully"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
