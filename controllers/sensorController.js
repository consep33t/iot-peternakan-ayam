let sensorData = {
  ir1: "0",
  ir2: "0",
  ir3: "0",
  distance_feed: "0",
  distance_water: "0",
};

exports.getSensorData = async (req, res) => {
  res.json(sensorData);
};

exports.updateSensorData = async (topic, message) => {
  const data = message.toString();

  if (topic === "iot/ayam/ir1") sensorData.ir1 = data;
  else if (topic === "iot/ayam/ir2") sensorData.ir2 = data;
  else if (topic === "iot/ayam/ir3") sensorData.ir3 = data;
  else if (topic === "iot/ayam/distance_feed") sensorData.distance_feed = data;
  else if (topic === "iot/ayam/distance_water")
    sensorData.distance_water = data;

  console.log(`[${topic}] => ${data}`);
};
