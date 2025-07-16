const express = require("express");
const {
  getSchedules,
  createSchedule,
  deleteSchedule,
  updateSchedule,
} = require("../controllers/scheduleController");

const router = express.Router();

router.get("/", getSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);
router.put("/:id", updateSchedule);

module.exports = router;
