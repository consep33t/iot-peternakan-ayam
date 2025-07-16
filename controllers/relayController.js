let statusRelay = {
  feed: "off",
  water: "off",
};

exports.getRelayStatus = async (req, res) => {
  res.json(statusRelay);
};

exports.controlRelay = async (req, res) => {
  const { type, state } = req.body;
  const mqttClient = req.app.get("mqttClient");

  if (type === "feed") {
    mqttClient.publish("iot/ayam/relay_feed", state);
    statusRelay.feed = state;
  } else if (type === "water") {
    mqttClient.publish("iot/ayam/relay_water", state);
    statusRelay.water = state;
  }

  res.json({ message: `Relay ${type} set to ${state}` });
};

exports.updateRelayStatus = async (topic, message) => {
  const data = message.toString();
  if (topic === "iot/ayam/status_feed") statusRelay.feed = data;
  else if (topic === "iot/ayam/status_water") statusRelay.water = data;
  console.log(`[${topic}] => ${data}`);
};
