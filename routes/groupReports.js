const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  reportGroupValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
} = require("../helper_functions/helpers");
const { chkExistingGroup } = require("../database_queries/chat");
const { chkAlreadyReportedGroup, reportGroup } = require("../database_queries/groupReport");

// Report Groups
router.post("/reportGroup", trimRequest.all, async (req, res) => {
  try {
    // Code goes here
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error.message));
  }
});

module.exports = router;
