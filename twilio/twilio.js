const { getEnv } = require("../config");

const accountSid = getEnv("TWILIO_ACCOUNT_SID");
const authToken = getEnv("TWILIO_AUTH_TOKEN");
const myNumber = getEnv("MY_NUMBER");
const client = require("twilio")(accountSid, authToken);

const send_message = async ({ body, number }) => {
  // return true;
  try {
    const chk = await client.messages.create({
      body,
      from: "DEFIGRAM",
      to: number,
    });
    if (chk) {
      return true;
    }
  } catch (Error) {
    return client.messages.create({
      body,
      from: myNumber,
      to: number,
    });
  }
};

module.exports = { send_message };
