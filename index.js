const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

var cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
