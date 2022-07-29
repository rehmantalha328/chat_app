const router = require("express").Router();
const trimRequest = require("trim-request");
const Prisma_Client = require("../../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

router.post("/getAllRegisteredUsers", trimRequest.all, async (req, res) => {
  try {
    
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error));
  }
});

module.exports = router;
