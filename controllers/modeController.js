let systemMode = "auto";

exports.getMode = async (req, res) => {
  res.json({ mode: systemMode });
};

exports.setMode = async (req, res) => {
  const { mode } = req.body;
  const mqttClient = req.app.get("mqttClient");

  if (mode === "auto" || mode === "schedule") {
    mqttClient.publish("iot/ayam/mode", mode);
    systemMode = mode;
    res.json({ message: `Mode changed to ${mode}` });
  } else {
    res.status(400).json({ error: "Invalid mode" });
  }
};
