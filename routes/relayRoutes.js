const express = require("express");
const {
  getRelayStatus,
  controlRelay,
} = require("../controllers/relayController");

const router = express.Router();
router.get("/", getRelayStatus);
router.post("/control", controlRelay);
module.exports = router;
