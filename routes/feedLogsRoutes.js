const express = require("express");
const {
  getFeedRefillLogs,
  addFeedRefillLog,
  getFeedRefillLogsWeekly,
  getFeedRefillLogsMonthly,
  getFeedRefillLogsByRange,
} = require("../controllers/feedLogsController");

const router = express.Router();

// Get all logs
router.get("/", getFeedRefillLogs);

// Add new log
router.post("/", addFeedRefillLog);

// Get logs grouped by week
router.get("/weekly", getFeedRefillLogsWeekly);

// Get logs grouped by month
router.get("/monthly", getFeedRefillLogsMonthly);

// Get logs by custom date range
router.get("/range", getFeedRefillLogsByRange);

module.exports = router;
