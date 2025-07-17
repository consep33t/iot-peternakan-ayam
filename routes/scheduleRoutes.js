const express = require("express");
const {
  getSchedules,
  createSchedule,
  deleteSchedule,
  updateSchedule,
  enableSchedule,
  disableSchedule,
} = require("../controllers/scheduleController");

const router = express.Router();

router.get("/", getSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);
router.put("/:id", updateSchedule);
router.put("/:id/enable", enableSchedule);
router.put("/:id/disable", disableSchedule);

module.exports = router;
