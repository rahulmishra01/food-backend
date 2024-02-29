const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const UserModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      validate: [validator.isEmail, "please enter valid email"],
    },
    password: {
      type: String,
      require: true,
    },
    image: {
      type: String,
    },
    phoneNumber: {
      type: Number,
      require: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordOtp: {
      type: String,
      default: "",
    },
    forgotPasswordOtpExpire: {
      type: Date,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordTokenExpire: {
      type: Date,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
// JWT TOKEN
UserModel.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// compare forgot password
UserModel.methods.compareForgotPasswordOTP = async function (
  forgotPasswordOtp
) {
  const isMatch = await bcrypt.compare(
    forgotPasswordOtp,
    this.forgotPasswordOtp
  );
  return isMatch;
};

module.exports = mongoose.model("user", UserModel);
