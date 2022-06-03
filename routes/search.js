const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const {
  signUpValidation,
  checkEmailValidation,
  referalIdValidation,
} = require("../joi_validations/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteSingleImage,
  clean,
} = require("../helper_functions/helpers");
const {
  getUserFromphone,
  chkExistingUserName,
} = require("../database_queries/auth");
var _ = require("lodash");

// SIMPLE SIGNUP USER
router.get("/searchAllUsers", [trimRequest.all], async (req, res) => {
  try {
    const allusers = await prisma.user.findMany({
      where: {
        is_registered: true,
        NOT: [
          {
            user_id: req?.user?.user_id,
          },
        ],
      },
      select: {
        username: true,
        user_id: true,
        phone: true,
        profile_img: true,
        online_status: true,
        online_status_time: true,
      },
      orderBy: {
        created_at:'desc',
      }
    });
    const users = allusers?.map((arr) => {
      arr.is_group_chat = false;
      return arr;
    });
    const updateArray = [...users];
    const sorted = _.orderBy(updateArray, ["created_at"], ["desc"]);
    if (allusers) return res.status(200).send(getSuccessData(sorted));
    return res.status(404).send(getError("no any user found"));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});


module.exports = router;
