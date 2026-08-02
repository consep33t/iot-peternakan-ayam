const express = require("express");
const cors = require("cors");
const http = require("http");
const session = require("express-session");
require("dotenv").config();

const { initSocket } = require("./config/socket");
const { initMQTT } = require("./config/mqtt");
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");
const { securityHeaders, apiLimiter, authLimiter } = require("./middlewares/securityMiddleware");
const prisma = require("./config/prisma");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// ===== Initialize Socket.IO & MQTT =====
const io = initSocket(server);
const mqttClient = initMQTT(io);

// Store instances in Express app settings
app.set("mqttClient", mqttClient);
app.set("io", io);

// ===== Security & Core Middlewares =====
app.use(securityHeaders);

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.text({ limit: "1mb" }));

// Rate Limiters
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Secure Session Management
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "supersecretkey_iot_ayam_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ===== MQTT Message Handlers =====
const { updateSensorData } = require("./controllers/sensorController");
const { updateRelayStatus } = require("./controllers/relayController");

mqttClient.on("message", async (topic, message) => {
  updateSensorData(topic, message, io);
  updateRelayStatus(topic, message, io);

  // Auto-record weight log when published via MQTT (iot/ayam/log_berat or iot/ayam/weight or iot/ayam/timbangan)
  if (
    topic === "iot/ayam/log_berat" ||
    topic === "iot/ayam/weight" ||
    topic === "iot/ayam/timbangan"
  ) {
    try {
      const msgStr = message.toString();
      let weightVal = null;
      try {
        const parsed = JSON.parse(msgStr);
        weightVal =
          parsed.weight_grams ??
          parsed.weightGrams ??
          parsed.weight ??
          parsed.berat ??
          parsed.gram;
      } catch {
        weightVal = parseFloat(msgStr);
      }

      if (weightVal !== null && !isNaN(parseFloat(weightVal))) {
        const newLog = await prisma.chickenWeightLog.create({
          data: { weightGrams: parseFloat(weightVal) },
        });
        console.log(`⚖️ [MQTT Scale Recorded] ID: ${newLog.id}, Weight: ${newLog.weightGrams}g`);
        if (io) {
          io.emit("newWeightLog", {
            id: newLog.id,
            weight_grams: newLog.weightGrams,
            weigh_time: newLog.weighTime,
          });
        }
      }
    } catch (err) {
      console.error("❌ Error saving MQTT weight log:", err.message);
    }
  }
});

// ===== API Routes =====
const authRoutes = require("./routes/authRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const relayRoutes = require("./routes/relayRoutes");
const modeRoutes = require("./routes/modeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const feedLogsRoutes = require("./routes/feedLogsRoutes");
const weightLogsRoutes = require("./routes/weightLogsRoutes");
const timeRoutes = require("./routes/timeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/relay", relayRoutes);
app.use("/api/mode", modeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/feed-logs", feedLogsRoutes);
app.use("/api/weight-logs", weightLogsRoutes);
app.use("/api/time", timeRoutes);

// ===== Error Handling Middlewares =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== Start Server =====
server.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port} with Prisma ORM & Hardened Security`);
});
