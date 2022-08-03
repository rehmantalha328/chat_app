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
const { AdminApproval } = require("@prisma/client");

// Update user password after verification of otp
router.post("/UpdatePassword", [trimRequest.all], async (req, res) => {
  try {
    const { error, value } = updatePasswordValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    // all code goes here
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
    // All code goes here
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
    console.log("req.body", req.body);
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError(error.details[0].message));
    }
    if (req.file_error) {
      deleteUploadedGalleryOrProfile(req);
      return res.status(404).send(getError(req.file_error));
    }
    // All code goes here
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
    // All code goes here
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

module.exports = router;
