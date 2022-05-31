const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const { chkUsername, updateProfile } = require("../joi_validations/validate");
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
// const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
// const imagemulter = require("../middleWares/imageMulter");
// const { fs } = require("file-system");

// add username
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

// update User profile info
router.post("/updateUserProfile", trimRequest.all, async (req, res) => {
    const { user_id } = req.user;
    const { error, value } = updateProfile(req.body);
    if (error) {
        return res.status(404).send(getError(error.details[0].message));
    }
    const { user_name: _user_name } = value;
    const user_name = _user_name.toLowerCase();
    const getExistingUser = await chkExistingUsername(user_name);
    if (getExistingUser) {
        return res.status(404).send(getError("This username exists"));
    }
    const updateUser = await prisma.user.update({
        where: {
            user_id,
        },
        data: {
            user_name,
        }
    });
    if (updateUser) {
        return res.status(200).send(getSuccessData(updateUser));
    }
});

module.exports = router;
