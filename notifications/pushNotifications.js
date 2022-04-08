var admin = require("firebase-admin");

var serviceAccount = require("./abiwachu-b0ff9-firebase-adminsdk-lmly6-e542509826.json");

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

module.exports = { SendNotification };