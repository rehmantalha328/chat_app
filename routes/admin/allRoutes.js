const router = require("express").Router();
const trimRequest = require("trim-request");
const { getUserFromId } = require("../../database_queries/auth");
const { getSuccessData, getError } = require("../../helper_functions/helpers");
const Prisma_Client = require("../../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const { AdminApproval } = require("@prisma/client");
const { blockUserByAdminValidate } = require("../../joi_validations/validate");


router.get("/getAllRegisteredUsers", trimRequest.all, async (req, res) => {
  try {
    let { user_id } = req.user;
    let admin_id = user_id;
    const getAllUsers = await prisma.user.findMany({
      where: {
        NOT: [
          {
            user_id: admin_id,
          },
        ],
        is_registered: true,
      },
      select: {
        user_id: true,
        username: true,
        user_name: true,
        birthday: true,
        about_me: true,
        phone: true,
        gender: true,
        online_status: true,
        online_status_time: true,
        created_at: true,
        my_gallery_pictures: {
          select: {
            picture_url: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });
    return res.status(200).send(getSuccessData(getAllUsers));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

router.post("/blockUser", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = blockUserByAdminValidate(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { user_id } = value;
    const isUserExists = await getUserFromId(user_id);
    if (!isUserExists) {
      return res.status(404).send(getError("User not found"));
    }
    if (isUserExists.admin_approval === AdminApproval.BLOCKED) {
      const unblockUser = await prisma.user.update({
        where: {
          user_id,
        },
        data: {
          admin_approval: AdminApproval.APPROVED,
        },
      });
      return res
        .status(200)
        .send(getSuccessData("You successfully unblock this user"));
    }
    const blockUser = await prisma.user.update({
      where: {
        user_id,
      },
      data: {
        admin_approval: AdminApproval.BLOCKED,
      },
    });
    return res
      .status(200)
      .send(getSuccessData("You successfully block this user"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
