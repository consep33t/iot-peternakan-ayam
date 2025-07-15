// ====== DEPENDENCY & SETUP ======
const mqtt = require("mqtt");
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Wrap all logic inside async IIFE
(async () => {
  const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "consep33t",
    database: "iot_ayam",
  });

  // ====== DATA CACHE ======
  let sensorData = {
    ir1: "0",
    ir2: "0",
    ir3: "0",
    distance_feed: "0",
    distance_water: "0",
  };

  let statusRelay = {
    feed: "off",
    water: "off",
  };

  let systemMode = "auto"; // 'auto' or 'schedule'

  // ====== MQTT SETUP ======
  const mqttBroker = "mqtt://192.168.0.101:1883";
  const mqttClient = mqtt.connect(mqttBroker);

  mqttClient.on("connect", () => {
    console.log("✅ MQTT Connected to broker");
    mqttClient.subscribe("iot/ayam/#");
  });

  mqttClient.on("message", (topic, message) => {
    const data = message.toString();

    if (topic === "iot/ayam/ir1") sensorData.ir1 = data;
    else if (topic === "iot/ayam/ir2") sensorData.ir2 = data;
    else if (topic === "iot/ayam/ir3") sensorData.ir3 = data;
    else if (topic === "iot/ayam/distance_feed")
      sensorData.distance_feed = data;
    else if (topic === "iot/ayam/distance_water")
      sensorData.distance_water = data;
    else if (topic === "iot/ayam/status_feed") statusRelay.feed = data;
    else if (topic === "iot/ayam/status_water") statusRelay.water = data;

    console.log(`[${topic}] => ${data}`);
  });

  // ====== API ROUTES ======
  app.get("/api/sensor", (req, res) => {
    res.json(sensorData);
  });

  app.get("/api/relay", (req, res) => {
    res.json(statusRelay);
  });

  app.post("/api/control", (req, res) => {
    const { type, state } = req.body;

    if (type === "feed") {
      mqttClient.publish("iot/ayam/relay_feed", state);
      statusRelay.feed = state;
    } else if (type === "water") {
      mqttClient.publish("iot/ayam/relay_water", state);
      statusRelay.water = state;
    }

    res.json({ message: `Relay ${type} set to ${state}` });
  });

  // Get Mode
  app.get("/api/mode", (req, res) => {
    res.json({ mode: systemMode });
  });

  // Ganti mode antara 'auto' dan 'schedule'
  app.post("/api/mode", (req, res) => {
    const { mode } = req.body;
    if (mode === "auto" || mode === "schedule") {
      mqttClient.publish("iot/ayam/mode", mode);
      systemMode = mode; // ⬅️ Tambahkan ini
      res.json({ message: `Mode changed to ${mode}` });
    } else {
      res.status(400).json({ error: "Invalid mode" });
    }
  });

  // Jadwal API
  app.get("/api/schedules", async (req, res) => {
    const [rows] = await db.query(
      "SELECT * FROM schedules ORDER BY hour, minute"
    );
    res.json(rows);
  });

  app.post("/api/schedules", async (req, res) => {
    const { type, hour, minute } = req.body;

    await db.query(
      "INSERT INTO schedules (type, hour, minute) VALUES (?, ?, ?)",
      [type, hour, minute]
    );

    const topic = `iot/ayam/schedule_${type}`;
    mqttClient.publish(
      topic,
      JSON.stringify({ start_hour: hour, start_minute: minute })
    );

    res.json({ success: true });
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    const id = req.params.id;
    await db.query("DELETE FROM schedules WHERE id = ?", [id]);
    res.json({ success: true });
  });

  // ====== START SERVER ======
  app.listen(port, () => {
    console.log(`\uD83D\uDE80 Backend API running at http://localhost:${port}`);
  });
})();
