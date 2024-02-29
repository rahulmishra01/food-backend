const mongoose = require("mongoose");

const ConnectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
      console.log("MongoDB connected");
    });
  } catch (error) {
    console.log(`Error : ${error.message}`);
  }
};
module.exports = ConnectDB;
