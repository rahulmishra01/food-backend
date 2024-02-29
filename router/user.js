const express = require("express");
const router = express.Router();
const { Register, verifyUser } = require("../controller/userController");
const { isAuthincated } = require("../middleware/authentication");

router.post("/register", Register);
router.put("/verify", isAuthincated, verifyUser);

module.exports = router;
