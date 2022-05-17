const { getEnv } = require("../config");

const accountSid = getEnv("TWILIO_ACCOUNT_SID");
const authToken = getEnv("TWILIO_AUTH_TOKEN");
const myNumber = getEnv("MY_NUMBER");
const client = require("twilio")(accountSid, authToken);

const send_message = ({ body, number }) => {
  // return true;
  try {
    return client.messages.create({
      body,
      from: "DEFIGRAM",
      to: number,
    });
  } catch (err) {
    return client.messages.create({
      body,
      from: myNumber,
      to: number,
    });
  }
};

module.exports = { send_message };
