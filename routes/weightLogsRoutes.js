const express = require("express");
const {
  getAllLogs,
  getLogsPerWeek,
  getLogsPerMonth,
  getLogsByRange,
  createLog,
} = require("../controllers/weightLogsController");

const router = express.Router();

// Get all logs
router.get("/", getAllLogs);

// Get logs per week
router.get("/weekly", getLogsPerWeek);

// Get logs per month
router.get("/monthly", getLogsPerMonth);

// Get logs by custom date range
router.get("/range", getLogsByRange);

// Create new log
router.post("/", createLog);

module.exports = router;
