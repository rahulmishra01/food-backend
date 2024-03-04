const UserModel = require("../model/user");
const crypto = require("crypto");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../middleware/token");
const bcrypt = require("bcrypt");
const OtpModel = require("../model/otp");
const SendMail = require("../utils/mailer");

const Register = catchAsyncError(async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return next(new ErrorHandler("User already exist", 400, res));
    } else if (!password) {
      return next(new ErrorHandler("please provide the password", 400, res));
    }
    const hashPassowrd = await bcrypt.hash(password, 10);

    const random = Math.floor(Math.random() * 899999) + 100000;

    await OtpModel.create({ email: email, otp: random });
    const data = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashPassowrd,
      phoneNumber,
    });

    await SendMail(email, firstName, random);
    sendToken(data, 201, res);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

const verifyUser = catchAsyncError(async (req, res, next) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;
    if (otp.lenth === 0) {
      return next(new ErrorHandler("Please fill the otp here...", 400, res));
    }
    const otpData = await OtpModel.findOne({ email });
    if (!otpData) {
      return next(new ErrorHandler("user not found here...", 400, res));
    }
    const compareOtp = await otpData.CompareOtp(otp);

    if (compareOtp) {
      const user = await UserModel.findOneAndUpdate(
        {
          email,
        },
        { isVerified: true },
        { new: true }
      );
      const token = await user.getJWTToken();
      await OtpModel.findOneAndDelete({ email });
      return res.status(200).json({
        message: "user varified successfully",
        data: {
          access_token: token,
          _id: user._id,
          name: user.firstName + " " + user.lastName,
          email: user.email,
        },
      });
    } else {
      return next(new ErrorHandler("Please fill right otp here...", 400, res));
    }
  } catch (error) {
    console.log("Error---------------->", error);
    return res.status(500).json({ error: error });
  }
});

const resendOTP = catchAsyncError(async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(
        new ErrorHandler("please enter the valid email address", 400, res)
      );
    }
    const resendOtp = (Math.floor(Math.random() * 899999) + 100000).toString();
    const firstName = user.firstName;
    await SendMail(email, firstName, resendOtp);
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(resendOtp, salt);
    await OtpModel.findOneAndUpdate({ email: email }, { otp: hashedOtp });
    return res
      .status(200)
      .json({ success: true, message: "Otp has been sended to your email" });
  } catch (error) {
    console.log("error===========>", error);
    return res.status(500).json({ error: error });
  }
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
  try {
    const { email } = req.body;
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return next(
        new ErrorHandler("please enter valid email here...", 400, res)
      );
    } else if (checkUser.isVerified === false) {
      return next(new ErrorHandler("please verify your account...", 400, res));
    }

    const generatOtp = (Math.floor(Math.random() * 899999) + 100000).toString();
    await SendMail(email, checkUser.firstName, generatOtp);

    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(generatOtp, salt);

    await UserModel.findOneAndUpdate(
      { email },
      {
        forgotPasswordOtp: hashOtp,
        forgotPasswordOtpExpire: Date.now() + 5 * 60 * 1000,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "otp sended to your email" });
  } catch (error) {
    console.log("error----------->", error);
    return res.status(500).json({ error: error });
  }
});

const verifyForgotPassword = catchAsyncError(async (req, res, next) => {
  try {
    const { email, forgotPasswordOtp } = req.body;
    if (!forgotPasswordOtp) {
      return next(new ErrorHandler("otp can't be blank", 400, res));
    }
    const user = await UserModel.findOne({
      email,
      forgotPasswordOtpExpire: { $gt: Date.now() },
    });
    if (!user) return next(new ErrorHandler("Session expired...", 400, res));
    const valid = await user.compareForgotPasswordOTP(forgotPasswordOtp);
    if (valid) {
      const resetToken = crypto.randomBytes(20).toString("hex");
      await UserModel.findOneAndUpdate(
        { email },
        {
          forgotPasswordOtp: "",
          forgotPasswordOtpExpire: "",
          resetPasswordToken: crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex"),
          resetPasswordTokenExpire: Date.now() + 5 * 60 * 1000,
        }
      );
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: `Reset Token`,
        token: resetToken,
      });
    }
  } catch (error) {
    console.log("error============>", error);
    return res.status(500).json({ error: error });
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  try {
    const { email, resetPasswordToken, newPassword, confirmPassword } =
      req.body;
    const resetToken = crypto
      .createHash("sha256")
      .update(resetPasswordToken)
      .digest("hex");
    const user = await UserModel.findOne({ email });
    if (!user)
      return next(new ErrorHandler("please enter valid email", 400, res));
    if (resetToken !== user.resetPasswordToken) {
      return next(new ErrorHandler("invalid token", 400, res));
    }
    if (newPassword !== confirmPassword) {
      return next(new ErrorHandler("password not match...", 400, res));
    }
    const selt = await bcrypt.genSalt(10);
    const handleData = await bcrypt.hash(newPassword, selt);
    const data = await UserModel.findOneAndUpdate(
      { email },
      {
        password: handleData,
        resetPasswordToken: "",
        resetPasswordTokenExpire: "",
      }
    );
    return res.status(200).json({ message: "password has been updated", data });
  } catch (error) {
    console.log("error------------->", error);
    return res.status(500).json({ error: error });
  }
});

const Login = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Plase enter email and password", 400, res));
    }
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user)
      return next(
        new ErrorHandler("please enter the valid email address..", 400, res)
      );
    else {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return next(new ErrorHandler("invalid password...", 400, res));
      }
    }
    if (!user.isVerified) {
      return next(
        new ErrorHandler(
          "please verify first the your should continue...",
          400,
          res
        )
      );
    }
    sendToken(user, 200, res);
  } catch (error) {
    console.log("error============>", error);
    return res.status(500).json({ error: error });
  }
});

module.exports = {
  Register,
  verifyUser,
  resendOTP,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  Login,
};
