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

// There is socket connection established and there is connection & disconnection
const setUpSocket = (server) => {
  io = socketio(server);
  io.on("connect", (socket) => {
    // here socket connects and other functions will perform
    socket.on("disconnect", async () => {
    //  Here Socket disconnects
      console.log(`A User Disconnected With Socket_Id:${socket.id}`);
    });
  });
};
// End this section

// These are all emitter for front-end to emit data in socket
const newGroupCreated = (groupMembers, creator_id, group_name, group_id, group_image, created_at, is_group_chat) => {
  // Code goes here
};

// End Emitters

module.exports = {
  setUpSocket,
  newGroupCreated,
};
