const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const compression = require("compression");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io-client");
const app = express();

app.enable("trust proxy");

// Middleware
app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));

const authConfig = require("./config/auth.config.js");

const signToken = (user) => {
  return jwt.sign(user, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  });
};

const token = signToken({
  id: 1,
  name: "Hoang Ho",
  username: "hoang.ho",
});

const socket = io(`${process.env.SOCKET_URL}`, {
  auth: { 
    token: token 
  },
  query: {
    tenantId: 1
  }
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO Server:", socket.id);

  // Gửi yêu cầu lấy master data từ server
  socket.emit("getMasterData");
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

// Lắng nghe sự kiện từ server
socket.on("masterDataResponse", (data) => {
  console.log("Received data:", data.message);
});

app.use((req, res, next) => {
  req.socket = socket;
  return next();
});

module.exports = app;
