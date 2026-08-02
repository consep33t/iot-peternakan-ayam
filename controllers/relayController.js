let statusRelay = {
  feed: "off",
  water: "on",
};

exports.getRelayStatus = async (req, res) => {
  res.json(statusRelay);
};

exports.controlRelay = async (req, res) => {
  const { type, state } = req.body;
  const mqttClient = req.app.get("mqttClient");
  const io = req.app.get("io");

  if (type === "feed") {
    mqttClient.publish("iot/ayam/relay_feed", state);
    statusRelay.feed = state;
  } else if (type === "water") {
    mqttClient.publish("iot/ayam/relay_water", state);
    statusRelay.water = state;
  }

  if (io) {
    io.emit("relayStatus", statusRelay);
  }

  res.json({ message: `Relay ${type} set to ${state}` });
};

exports.updateRelayStatus = async (topic, message, io) => {
  const data = message.toString();
  if (topic === "iot/ayam/status_feed") statusRelay.feed = data;
  else if (topic === "iot/ayam/status_water") statusRelay.water = data;

  if (io) {
    io.emit("relayStatus", statusRelay);
  }

  console.log(`[${topic}] => ${data}`);
};
