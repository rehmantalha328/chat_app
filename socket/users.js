const jwt = require("jsonwebtoken");
const { getEnv } = require("../config");
const { getUserFromId } = require("../database_queries/auth");
const {
  updateOnlineStatus,
  updateOfflineStatus,
} = require("../database_queries/onlineOfflineStatus");
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

const users = [];
const findSender = (sender_id) => users.find((u) => u.id == sender_id);
const findReciever = (reciever_id) => users.find((u) => u.id == reciever_id);

const addUser = async ({ token, socketId }) => {
  if (!token) return { error: "Token is required.!" };
  try {
    //  Here user will add in socket
  } catch (err) {
    return { error: err };
  }
};

const removeUser = async (socketId) => {
  // Remove user form socket
}

const getUser = (id, socketId = null) =>{}
  // Get user in socket connection

module.exports = {
  addUser,
  removeUser,
  getUser,
  findSender,
  findReciever,
};
