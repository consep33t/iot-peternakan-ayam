// server.js
const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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

// Socket.IO events
io.on("connection", (socket) => {
  console.log("🔌 Frontend terhubung ke WebSocket");

  socket.on("disconnect", () => {
    console.log("❌ FE disconnect dari WebSocket");
  });
});

// Simpan instance socket agar bisa diakses dari controller
app.set("mqttClient", mqttClient);
app.set("io", io);

// MQTT Handler
const { updateSensorData } = require("./controllers/sensorController");
const { updateRelayStatus } = require("./controllers/relayController");

mqttClient.on("message", (topic, message) => {
  updateSensorData(topic, message, io);
  updateRelayStatus(topic, message, io); // sekarang kita teruskan io
});

// Routes
const sensorRoutes = require("./routes/sensorRoutes");
const relayRoutes = require("./routes/relayRoutes");
const modeRoutes = require("./routes/modeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const feedLogsRoutes = require("./routes/feedLogsRoutes");
const weightLogsRoutes = require("./routes/weightLogsRoutes");

app.use("/api/sensor", sensorRoutes);
app.use("/api/relay", relayRoutes);
app.use("/api/mode", modeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/feed-logs", feedLogsRoutes);
app.use("/api/weight-logs", weightLogsRoutes);

const timeRoutes = require("./routes/timeRoutes");
app.use("/api/time", timeRoutes);

// Mulai server HTTP + Socket
server.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
