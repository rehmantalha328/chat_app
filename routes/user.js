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
    // Code here
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
    // Code here
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
      // Code goes here
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
    // Code goes here
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
      // Code goes here
    } catch (catchError) {
      if (catchError && catchError.message) {
        return res.status(404).send(getError(catchError.message));
      }
      return res.status(404).send(getError(catchError));
    }
  }
);

module.exports = router;
