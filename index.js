// server.js
const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// MQTT Setup
const mqttBroker = process.env.MQTT_IP_BROKER;
const mqttClient = mqtt.connect(mqttBroker);

mqttClient.on("connect", () => {
  console.log("✅ MQTT Connected to broker");
  mqttClient.subscribe("iot/ayam/#");
});

const { updateSensorData } = require("./controllers/sensorController");
const { updateRelayStatus } = require("./controllers/relayController");

mqttClient.on("message", (topic, message) => {
  updateSensorData(topic, message);
  updateRelayStatus(topic, message);
});

app.set("mqttClient", mqttClient);

// Routes
const sensorRoutes = require("./routes/sensorRoutes");
const relayRoutes = require("./routes/relayRoutes");
const modeRoutes = require("./routes/modeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const feedLogsRoutes = require("./routes/feedLogsRoutes");

app.use("/api/sensor", sensorRoutes);
app.use("/api/relay", relayRoutes);
app.use("/api/mode", modeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/feed-logs", feedLogsRoutes);

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
});
