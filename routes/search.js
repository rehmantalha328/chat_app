const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const { signUpValidation } = require("../joi_validations/validate");
const { getError, getSuccessData } = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
var _ = require("lodash");

// SIMPLE SIGNUP USER
router.get("/searchAllUsers", [trimRequest.all], async (req, res) => {
  try {
    // Code goes here
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

// Get my groups my chatmates and all registered users in this API
router.get("/getMyAllData", trimRequest.all, async (req, res) => {
  try {
    // Code goes here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
