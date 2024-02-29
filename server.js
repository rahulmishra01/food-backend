require("dotenv").config();
const express = require("express");
const app = express();
const ConnectDB = require("./config/database");
const userRoutes = require("./router/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");

ConnectDB();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Backend API is working!</h1>");
});

app.listen(4000, () => {
  console.log("Server is running", 4000);
});
