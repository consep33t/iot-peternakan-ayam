const express = require("express");
const {
  login,
  logout,
  getSession,
  register,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/session", getSession);
router.post("/register", register);

module.exports = router;
