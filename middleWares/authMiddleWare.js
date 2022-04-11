const jwt = require("jsonwebtoken");
const { getEnv } = require("../config");
const { getError } = require("../helper_functions/helpers");
const { getUserFromId } = require("../database_queries/auth");

module.exports = async function (req, res, next) {
    const token = req.header("auth-token");
    if (!token) return res.status(404).send(getError("Access Denied"));
    // try {
        const verified = jwt.verify(token, getEnv("JWT_SECRET"));
        const { _id: id } = verified;
        const user = await getUserFromId(id);
        if (!user) return res.status(404).send(getError("Unauthorized..! Please refresh your token."));
        // console.log(user);
        req.user = user;
        next();
    // }
    // catch (err) {
    //     if (err & err.message) {
    //         return res.status(404).send(getError(err.message));
    //     }
    //     return res.status(404).send(getError(err));
    // }
};