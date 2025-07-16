const express = require("express");
const { getMode, setMode } = require("../controllers/modeController");

const router = express.Router();
router.get("/", getMode);
router.post("/", setMode);
module.exports = router;
