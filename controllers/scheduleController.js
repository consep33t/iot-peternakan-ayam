const db = require("../db/connection");

exports.getSchedules = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM schedules ORDER BY hour, minute"
  );
  res.json(rows);
};

exports.createSchedule = async (req, res) => {
  const { type, hour, minute } = req.body;
  await db.query(
    "INSERT INTO schedules (type, hour, minute) VALUES (?, ?, ?)",
    [type, hour, minute]
  );

  const mqttClient = req.app.get("mqttClient");
  mqttClient.publish(
    `iot/ayam/schedule_${type}`,
    JSON.stringify({ start_hour: hour, start_minute: minute })
  );

  res.json({ success: true });
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM schedules WHERE id = ?", [id]);
  res.json({ success: true });
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { type, hour, minute, enabled } = req.body;

  await db.query(
    "UPDATE schedules SET type = ?, hour = ?, minute = ?, enabled = ? WHERE id = ?",
    [type, hour, minute, enabled, id]
  );

  if (enabled == 1) {
    const mqttClient = req.app.get("mqttClient");
    mqttClient.publish(
      `iot/ayam/schedule_${type}`,
      JSON.stringify({ start_hour: hour, start_minute: minute })
    );
  }

  res.json({ success: true });
};

exports.enableSchedule = async (req, res) => {
  const { id } = req.params;

  // Ambil detail jadwal yang akan di-enable
  const [[schedule]] = await db.query("SELECT * FROM schedules WHERE id = ?", [
    id,
  ]);

  if (!schedule) {
    return res
      .status(404)
      .json({ success: false, message: "Schedule not found" });
  }

  // Aktifkan jadwal
  await db.query("UPDATE schedules SET enabled = 1 WHERE id = ?", [id]);

  // Kirim via MQTT
  const mqttClient = req.app.get("mqttClient");
  mqttClient.publish(
    `iot/ayam/schedule_${schedule.type}`,
    JSON.stringify({ start_hour: schedule.hour, start_minute: schedule.minute })
  );

  res.json({ success: true });
};

exports.disableSchedule = async (req, res) => {
  const { id } = req.params;

  const [[schedule]] = await db.query("SELECT * FROM schedules WHERE id = ?", [
    id,
  ]);

  if (!schedule) {
    return res
      .status(404)
      .json({ success: false, message: "Schedule not found" });
  }

  // Nonaktifkan jadwal
  await db.query("UPDATE schedules SET enabled = 0 WHERE id = ?", [id]);

  res.json({ success: true });
};
