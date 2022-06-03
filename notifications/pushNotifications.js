var admin = require("firebase-admin");

var serviceAccount = require("./defigram-7bc1c-firebase-adminsdk-jpzkf-15a1b448f4.json");

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