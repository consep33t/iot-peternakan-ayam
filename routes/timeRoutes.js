const express = require("express");
const router = express.Router();
const timeController = require("../controllers/timeController");

router.post("/", timeController.setTime);

module.exports = router;
