const express = require("express");
const http = require("http");
const app = express();
const { getEnv } = require("./config");
const PORT = getEnv("PORT");
const server = http.createServer(app);
var cors = require("cors");

// Importing All Routes
const otpVerification = require("./routes/otpVerification");
const signUpUser = require("./routes/auth");
const chat = require("./routes/chat");
const search = require("./routes/search");
const userAllActions = require("./routes/user");
const groupBlockReport = require("./routes/groupReports");
const AdminAuth = require("./routes/admin/admin_auth");
const AdminAccessRoutes = require("./routes/admin/allRoutes");
// END

// Importing JWT Verification
const verify = require("./middleWares/authMiddleWare");
// END

// Setup Scoket
const { setUpSocket } = require("./socket/socket");
setUpSocket(server);
// END

// Setup Mailer
const Mailer = require("./node_mailer/mailer");
Mailer.setupTransporter();
// END

// Setup Prisma Client
const Prisma_Client = require("./prisma_client/_prisma");
Prisma_Client.setupPrisma();
// END

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "public/"));

// Simple Routes without Authentication..
app.use("/api", [otpVerification, signUpUser]);
// END

// Admin Authentication
app.use("/adminAuth/api", [AdminAuth]);
// END

// Authenticated Routes
app.use("/api", verify, [chat, search, userAllActions, groupBlockReport]);
// END

// Authenticated Admin Routes
app.use("admin/api", verify, [chat, search, userAllActions, groupBlockReport]);
// END

server.listen(PORT, async () => {
  console.log(`Server is Listening on PORT ${PORT}`);
});

app.use("/", async (req, res) => {
  return res
    .status(200)
    .send({ response: "Defigram Server is up and running...." });
});
