const express = require("express");
const router = express.Router();
const {
  Register,
  verifyUser,
  resendOTP,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  Login,
} = require("../controller/userController");
const { isAuthincated } = require("../middleware/authentication");

router.post("/register", Register);
router.post("/verify", verifyUser);
router.put("/resend-otp", resendOTP);
router.put("/forgot-pasword", forgotPassword);
router.put("/verify-forgot-password", verifyForgotPassword)
router.put("/reset-password", resetPassword);
router.post("/login", Login);

module.exports = router;
