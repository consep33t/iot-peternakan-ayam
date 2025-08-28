const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://api.peternakan-ayam.site" || "http://localhost:5173",
    credentials: true,
  },
});

const port = process.env.PORT;

// ===== Middleware =====
app.use(
  cors({
    origin: "https://api.peternakan-ayam.site" || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: "iot-secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// ===== MQTT Setup =====
const mqttBroker = process.env.MQTT_IP_BROKER;
const mqttClient = mqtt.connect(mqttBroker);

mqttClient.on("connect", () => {
  console.log("✅ MQTT Connected to broker");
  mqttClient.subscribe("iot/ayam/#");
});

// ===== Socket.IO events =====
io.on("connection", (socket) => {
  console.log("🔌 Frontend terhubung ke WebSocket");

  socket.on("disconnect", () => {
    console.log("❌ FE disconnect dari WebSocket");
  });
});

// Simpan instance socket agar bisa diakses dari controller
app.set("mqttClient", mqttClient);
app.set("io", io);

// ===== MQTT Handler =====
const { updateSensorData } = require("./controllers/sensorController");
const { updateRelayStatus } = require("./controllers/relayController");

mqttClient.on("message", (topic, message) => {
  updateSensorData(topic, message, io);
  updateRelayStatus(topic, message, io);
});

// ===== Routes =====
const sensorRoutes = require("./routes/sensorRoutes");
const relayRoutes = require("./routes/relayRoutes");
const modeRoutes = require("./routes/modeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const feedLogsRoutes = require("./routes/feedLogsRoutes");
const weightLogsRoutes = require("./routes/weightLogsRoutes");
const timeRoutes = require("./routes/timeRoutes");

app.use("/api/auth", authRoutes); // 👉 tambahin auth di sini
app.use("/api/sensor", sensorRoutes);
app.use("/api/relay", relayRoutes);
app.use("/api/mode", modeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/feed-logs", feedLogsRoutes);
app.use("/api/weight-logs", weightLogsRoutes);
app.use("/api/time", timeRoutes);

// ===== Start Server =====
server.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
