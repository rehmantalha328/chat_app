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

const sendMessageToGroup = (sender_id, reciever, message) => {
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
          message_time: new Date().toLocaleTimeString(),
        });
      }
    });
  }
};

const sendMediaMessage = (sender_id, reciever_id, media, message_type) => {
  const chkSender = findSender(sender_id);
  if (chkSender) {
    const chkReciever = findReciever(reciever_id);
    if (chkReciever) {
      io.to(chkReciever.socketId).emit("newMediaMessage", {
        sender_id,
        reciever_id,
        media,
        message_type,
        message_time: new Date().toLocaleTimeString(),
      });
    }
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

const seenMessages = (id, second_user_id, message_id, seen_status) => {
  console.log("iam id:::", id);
  console.log("iam id:::", second_user_id);
  console.log("iam id:::", message_id);
  console.log("iam id:::", seen_status);
  const my_id = getUser(id);
  if (my_id) {
    console.log("my id found::", my_id);
    const otherUser = getUser(second_user_id);
    if (otherUser) {
      console.log("other user Id::", otherUser);
      io.to(otherUser.socketId).emit("seen_status", {
        reciever_id: id,
        sender_id: second_user_id,
        message_id,
        seen: seen_status,
      });
    }
  }
};

const userBlock = (blocker_id, blocked_id, block_status) => {
  const chkBlocker = getUser(blocker_id);
  if (chkBlocker) {
    const chkBlocked = getUser(blocked_id);
    if (chkBlocked) {
      io.to(chkBlocked.socketId).emit("block_status", {
        blocker_id,
        block_status,
      });
    }
  }
};

const togglePrivatePictures = (user_id, status) => {
  const my_id = getUser(user_id);
  if (my_id) {
    io.to(my_id.socketId).emit("show_private_pictures", {
      user_id,
      status,
    });
  }
};

const showNotifications = (user_id, status) => {
  const my_id = getUser(user_id);
  if (my_id) {
    io.to(my_id.socketId).emit("show_notifications", {
      user_id,
      status,
    });
  }
};

const sendBlockStatusByAdmin = (user_id, admin_approval) => {
  const chkBlocked = getUser(user_id);
  if (chkBlocked) {
    io.to(chkBlocked.socketId).emit("block_by_admin", {
      user_id,
      admin_approval,
    });
  }
};

const sendNotificationCounter = (sender_id, reciever_id, counter) => {
  const chkSender = getUser(sender_id);
  if (chkSender) {
    const chkReciever = getUser(reciever_id);
    if (chkReciever) {
      io.to(chkReciever.socketId).emit("notification_counter", {
        sender_id,
        reciever_id,
        counter,
      });
    }
  }
};

module.exports = {
  setUpSocket,
  sendTextMessage,
  sendMediaMessage,
  seenMessages,
  userBlock,
  togglePrivatePictures,
  showNotifications,
  sendBlockStatusByAdmin,
  sendNotificationCounter,
  sendMessageToGroup,
};
