const express = require("express");
const http = require("http");
const app = express();
const { getEnv } = require("./config");
const PORT = getEnv("PORT");
const server = http.createServer(app);
var cors = require("cors");

const otpVerification = require("./routes/otpVerification");
const signUpUser = require("./routes/auth");

const { setUpSocket } = require("./socket/socket");
setUpSocket(server);

const Mailer = require("./node_mailer/mailer");
Mailer.setupTransporter();

const Prisma_Client = require("./prisma_client/_prisma");
Prisma_Client.setupPrisma();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use("/api", [otpVerification, signUpUser]);

server.listen(PORT, async () => {
  console.log(`Server is Listening on PORT ${PORT}`);
});

app.use("/", async (req, res) => {
  return res
    .status(200)
    .send({ response: "Defigram Server is up and running...." });
});
