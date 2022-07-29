const router = require("express").Router();
const Prisma_Client = require("../../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const { adminAuthValidation } = require("../../joi_validations/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteExistigImg,
  clean,
  deleteUploadedGalleryOrProfile,
  createAdminToken,
} = require("../../helper_functions/helpers");
const { chkAdminExists } = require("../../database_queries/admin_auth/auth");

router.post("/adminAuth", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = adminAuthValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { email, password } = value;
    const isAdminExists = await chkAdminExists(email);
    if (!isAdminExists) {
      return res
        .status(404)
        .send(getError("No user exists with this email address"));
    }
    if (isAdminExists?.password !== password) {
      return res.status(404).send(getError("Invalid password"));
    }
    return res.status(200).send(getSuccessData(createAdminToken(isAdminExists)));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
