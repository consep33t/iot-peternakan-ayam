const mqtt = require("mqtt");

const initMQTT = (io) => {
  const mqttBroker = process.env.MQTT_IP_BROKER || "mqtt://localhost:1883";
  const mqttClient = mqtt.connect(mqttBroker);

  mqttClient.on("connect", () => {
    console.log("✅ MQTT Connected to broker:", mqttBroker);
    mqttClient.subscribe("iot/ayam/#", (err) => {
      if (err) console.error("❌ MQTT Subscribe Error:", err);
      else console.log("📡 Subscribed to topic: iot/ayam/#");
    });
  });

  mqttClient.on("error", (err) => {
    console.error("❌ MQTT Connection Error:", err.message);
  });

  return mqttClient;
};

module.exports = { initMQTT };
