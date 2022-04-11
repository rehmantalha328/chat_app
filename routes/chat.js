const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const {
  getError,
  getSuccessData,
} = require("../helper_functions/helpers");
// const {
// } = require("../database_queries/auth");

router.post("/groupChat", trimRequest.all, async (req, res) => {
    try {
        let 
    } catch (error) {
        if (error && error.message) {
            return res.status(404).send(getError(error.message))
        }
        return res.status(404).send(getError(error));
    }
})

module.exports = router;