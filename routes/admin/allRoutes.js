const router = require("express").Router();
const trimRequest = require("trim-request");
const { getSuccessData } = require("../../helper_functions/helpers");
const Prisma_Client = require("../../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

router.get("/getAllRegisteredUsers", trimRequest.all, async (req, res) => {
  try {
    console.log("here");
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

module.exports = router;
