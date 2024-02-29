const sendToken = (user, statusCode, res) => {
    console.log("user, statusCode,=============>", user, statusCode)
  const token = user.getJWTToken();
  res.set("Authorization", `token ${token}`);

  res.status(statusCode).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
