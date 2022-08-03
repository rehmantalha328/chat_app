const nodemailer = require("nodemailer");
const { getEnv } = require("../config");

class Mailer {
  static transporter = null;
  static setupTransporter() {
    this.transporter = nodemailer.createTransport({
      // Code goes here
    });
  }
  static async sendMail(reciver_email, subject, text) {
    await this.transporter.sendMail({
      from: {
        // Code goes here
      },
      to: {
        // Code goes here
      },
    });
  }
}

module.exports = Mailer;
