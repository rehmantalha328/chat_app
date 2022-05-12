const socketio = require("socket.io");
let io;
const {
  addUser,
  removeUser,
  findSender,
  findReciever,
  getUser,
} = require("./users");
const { getError, getSuccessData } = require("../helper_functions/helpers");

const setUpSocket = (server) => {
  io = socketio(server);
  io.on("connect", (socket) => {
    console.log("socket_id:", socket.id);
    socket.on("join", async ({ token }, callback) => {
      try {
        const { error, user } = await addUser({ token, socketId: socket.id });
        console.log("user added and joined::", user);
        if (error) return callback(getError(error));
        socket.broadcast.emit("userOnlineStatus", {
          user_id: user.id,
          online_status: true,
          online_status_time: new Date(),
        });
        return callback(
          getSuccessData("User Connected to Socket Successfully.")
        );
      } catch (err) {
        if (err && err.message) {
          console.log(getError(err.message));
          return getError(err.message);
        }
        console.log(getError(err));
        return getError(err);
      }
    });
    socket.on("logout", () => {
      console.log("iam logout listener");
      socket.disconnect(true);
    });
    socket.on("disconnect", async () => {
      const user = await removeUser(socket.id);
      console.log("disconnected_user", user);
      if (user) {
        socket.broadcast.emit("userOnlineStatus", {
          user_id: user.id,
          online_status: false,
          online_status_time: new Date(),
        });
      }
      console.log(`A User Disconnected With Socket_Id:${socket.id}`);
    });
  });
};

const sendMessageToGroup = (sender_id, reciever, message, message_type) => {
  console.log("sender::", sender_id);
  console.log("reciever::", reciever);
  console.log("message::", message);
  // return true;
  const chkSender = findSender(sender_id);
  if (chkSender) {
    reciever?.forEach((user) => {
      const reciever_id = user?.member?.user_id;
      const chkReciever = findReciever(reciever_id);
      if (chkReciever) {
        io.to(chkReciever.socketId).emit("newGroupMessage", {
          sender_id,
          message,
          message_type,
          message_time: new Date().toLocaleTimeString(),
        });
      }
    });
  }
};

const sendTextMessage = (sender_id, reciever_id, textMessage, message_type) => {
  const chkSender = findSender(sender_id);
  if (chkSender) {
    const chkReciever = findReciever(reciever_id);
    console.log(chkReciever);
    if (chkReciever) {
      io.to(chkReciever.socketId).emit("newTextMessage", {
        sender_id,
        reciever_id,
        message_body: textMessage,
        message_type,
        message_time: new Date().toLocaleTimeString(),
      });
    }
  }
};


module.exports = {
  setUpSocket,
  sendTextMessage,
  sendMessageToGroup,
};
