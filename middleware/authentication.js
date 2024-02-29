const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../utils/catchAsyncError");
const user = require("../model/user");
const jwt = require("jsonwebtoken");

exports.isAuthincated = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startWith("Bearer ")) {
    return next(new ErrorHandler("please login to access this", 401, res));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new ErrorHandler("please fill right token here", 401, res));
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await user.findById(decodeData.id);
  next();
});
