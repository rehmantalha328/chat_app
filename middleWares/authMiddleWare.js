const jwt = require("jsonwebtoken");
const { getEnv } = require("../config");
const { getError } = require("../helper_functions/helpers");
const { getUserFromId } = require("../database_queries/auth");

module.exports = async function (req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(404).send(getError("Access Denied"));
  try {
    // Authentication using JWT code goes here
  } catch (err) {
    if (err & err.message) {
      return res.status(404).send(getError(err.message));
    }
    return res.status(404).send(getError("Invalid Token!."));
  }
};
