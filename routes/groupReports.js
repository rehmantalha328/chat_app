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

router.post("/reportGroup", trimRequest.all, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { error, value } = reportGroupValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const {group_id,report_reason} = value;
    const isGroupExists = await chkExistingGroup(group_id);
    if (!isGroupExists) {
        return res.status(404).send(getError("Group doesn't exists"));
    }
    const isAlreadyReported = await chkAlreadyReportedGroup(group_id,user_id);
    if (isAlreadyReported) {
        return res.status(404).send(getError("You already reported this group"));
    }
    const createReport = await reportGroup(group_id,user_id,report_reason);
    return res.status(200).send(getSuccessData("Group reported successfully"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error.message));
  }
});

module.exports = router;
