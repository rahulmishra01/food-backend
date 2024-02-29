const UserModel = require("../model/user");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../middleware/token");
const bcrypt = require("bcrypt");
const otp = require("../model/otp");
const SendMail = require("../utils/mailer");

const Register = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exist", 400, res));
  } else if (!password) {
    return next(new ErrorHandler("please provide the password", 400, res));
  }
  const hashPassowrd = await bcrypt.hash(password, 10);

  const random = Math.floor(Math.random() * 899999) + 100000;

  await otp.create({ email: email, otp: random });
  const data = await UserModel.create({
    firstName,
    lastName,
    email,
    password: hashPassowrd,
    phoneNumber,
  });

  await SendMail(email, firstName, random);
    return res
      .status(200)
      .json({ data: data, message: "user created successfully.." });
//   sendToken(data, 201, res);
});

const verifyUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { isVerified } = req.body;
  const user = await UserModel.findByIdAndUpdate();
});

module.exports = { Register, verifyUser };
