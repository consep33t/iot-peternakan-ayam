exports.setTime = async (req, res) => {
  const { year, month, day, hour, minute, second } = req.body;
  const mqttClient = req.app.get("mqttClient");

  if (!year || !month || !day || !hour || !minute || second === undefined) {
    return res.status(400).json({ error: "Invalid time format" });
  }

  const payload = JSON.stringify({ year, month, day, hour, minute, second });
  mqttClient.publish("iot/ayam/set_time", payload);

  res.json({ message: "RTC update sent to ESP32" });
};
