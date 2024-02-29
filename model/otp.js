const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const OtpModel = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    otp: {
      type: String,
      require: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 300 },
    },
  },
  { timestamps: true }
);

OtpModel.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
});

OtpModel.methods.CompareOtp = async function (otp) {
  const isMatch = await bcrypt.compare(this.otp, otp);
  return isMatch;
};

module.exports = mongoose.model("otp", OtpModel);
