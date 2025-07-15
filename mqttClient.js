const mqtt = require("mqtt");
const fs = require("fs");

const sensorData = {};

// === MQTT Connection ===
const client = mqtt.connect("mqtt://localhost");

client.on("connect", () => {
  console.log("MQTT Connected");
  client.subscribe("iot/ayam/sensor");
  client.subscribe("iot/ayam/log_berat");
});

client.on("message", (topic, message) => {
  const msg = message.toString();
  if (topic === "iot/ayam/sensor") {
    Object.assign(sensorData, JSON.parse(msg));
  }
  if (topic === "iot/ayam/log_berat") {
    const log = JSON.parse(msg);
    const logs = JSON.parse(fs.readFileSync("./weightLogs.json", "utf-8"));
    logs.push(log);
    fs.writeFileSync("./weightLogs.json", JSON.stringify(logs, null, 2));
  }
});

function getSensorData() {
  return sensorData;
}

function sendControl(data) {
  client.publish("iot/ayam/control", JSON.stringify(data));
}

function sendSchedule(data) {
  client.publish("iot/ayam/schedule", JSON.stringify(data));
}

module.exports = { getSensorData, sendControl, sendSchedule };
