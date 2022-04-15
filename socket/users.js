const jwt = require("jsonwebtoken");
const { getEnv } = require("../config");
const { getUserFromId } = require("../database_queries/auth");
const {
  updateOnlineStatus,
  updateOfflineStatus,
} = require("../database_queries/onlineOfflineStatus");
const { getSuccessData } = require("../helper_functions/helpers");
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

const users = [];
const findSender = (sender_id) => users.find((u) => u.id == sender_id);
const findReciever = (reciever_id) => users.find((u) => u.id == reciever_id);

const addUser = async ({ token, socketId }) => {
  if (!token) return { error: "Token is required.!" };
  try {
    const { error: err, userData } = await getUserFromToken(token);
    if (err) {
      return { error: err };
    }
    const id = userData.user_id;
    // await updateOnlineStatus(id);
    const chkExistingUser = users.find((user) => user.id == id);
    if (chkExistingUser) return { error: "This user is already connected" };
    const user = { id, socketId, token };
    console.log("pushed user:::", user);
    users.push(user);
    return { user };
  } catch (err) {
    return { error: err };
  }
};

const removeUser = async (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index >= 0) {
    const { id } = users[index];
    // await updateOfflineStatus(id);
    return users.splice(index, 1)[0];
  }
};

const getUserFromToken = async (token) => {
  if (!token) return { error: "Token is required." };
  try {
    const verified = jwt.verify(token, getEnv("JWT_SECRET"));
    const { _id: id } = verified;
    const user = await getUserFromId(id);
    if (!user)
      return {
        error: "Unauthorized! Please login again to refresh token.",
      };
    return { userData: user };
  } catch (catchError) {
    if (catchError && catchError.message) {
      return { error: catchError.message };
    }
    return { error: "Invalid token!." };
  }
};

const getUser = (id, socketId = null) =>
  users.find((user) =>
    socketId ? user.socketId == socketId && user.id === id : user.id == id
);
//

module.exports = {
  addUser,
  getUserFromToken,
  removeUser,
  getUser,
  findSender,
  findReciever,
};
