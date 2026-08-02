const prisma = require("../config/prisma");

// Get all schedules ordered by time
exports.getSchedules = async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: [
        { hour: "asc" },
        { minute: "asc" },
      ],
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
};

// Create a new schedule
exports.createSchedule = async (req, res, next) => {
  const { type, hour, minute } = req.body;
  try {
    const newSchedule = await prisma.schedule.create({
      data: {
        type,
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        enabled: true,
      },
    });

    const mqttClient = req.app.get("mqttClient");
    if (mqttClient) {
      mqttClient.publish(
        `iot/ayam/schedule_${type}`,
        JSON.stringify({ start_hour: newSchedule.hour, start_minute: newSchedule.minute })
      );
    }

    res.status(201).json({ success: true, schedule: newSchedule });
  } catch (err) {
    next(err);
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.schedule.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Update a schedule
exports.updateSchedule = async (req, res, next) => {
  const { id } = req.params;
  const { type, hour, minute, enabled } = req.body;
  try {
    const updated = await prisma.schedule.update({
      where: { id: parseInt(id, 10) },
      data: {
        type,
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        enabled: Boolean(enabled),
      },
    });

    if (updated.enabled) {
      const mqttClient = req.app.get("mqttClient");
      if (mqttClient) {
        mqttClient.publish(
          `iot/ayam/schedule_${type}`,
          JSON.stringify({ start_hour: updated.hour, start_minute: updated.minute })
        );
      }
    }

    res.json({ success: true, schedule: updated });
  } catch (err) {
    next(err);
  }
};

// Enable schedule
exports.enableSchedule = async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id, 10) },
      data: { enabled: true },
    });

    const mqttClient = req.app.get("mqttClient");
    if (mqttClient) {
      mqttClient.publish(
        `iot/ayam/schedule_${schedule.type}`,
        JSON.stringify({ start_hour: schedule.hour, start_minute: schedule.minute })
      );
    }

    res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// Disable schedule
exports.disableSchedule = async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id, 10) },
      data: { enabled: false },
    });
    res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};
