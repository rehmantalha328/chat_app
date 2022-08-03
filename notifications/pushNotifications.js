var admin = require("firebase-admin");

var serviceAccount = require("");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const SendNotification = (
    token,
    notification,
    data = {},
    apns = {},
    android = {}
) => {
    return admin.messaging().send({
        token,
        notification,
        data,
        apns,
        android,
    });
};

// This module is for sending notifications to client side
module.exports = { SendNotification };