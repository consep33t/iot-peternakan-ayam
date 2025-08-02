const db = require("../db/connection");

// Get all logs
exports.getFeedRefillLogs = async (_, res) => {
  try {
    const [results] = await db.query("SELECT * FROM feed_refill_logs");
    res.json(results);
  } catch (err) {
    console.error("Error fetching feed logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add new log
exports.addFeedRefillLog = async (req, res) => {
  const { amount_kg } = req.body;
  const query = "INSERT INTO feed_refill_logs (amount_kg) VALUES (?)";
  try {
    const [results] = await db.query(query, [amount_kg]);
    res.status(201).json({
      message: "Feed refill log added successfully",
      logId: results.insertId,
    });
  } catch (err) {
    console.error("Error adding feed refill log:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Group by week
exports.getFeedRefillLogsWeekly = async (_, res) => {
  const query = `
    SELECT 
      refill_time AS date, -- gunakan datetime asli
      amount_kg,
      YEAR(refill_time) AS year,
      MONTH(refill_time) AS month,
      FLOOR((DAY(refill_time) - 1) / 7) + 1 AS week_of_month
    FROM feed_refill_logs
    ORDER BY year DESC, month DESC, week_of_month DESC, date DESC;
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Error fetching weekly feed logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Group by month
exports.getFeedRefillLogsMonthly = async (_, res) => {
  const query = `
    SELECT 
      refill_time AS date, -- gunakan datetime asli
      amount_kg,
      YEAR(refill_time) AS year,
      MONTH(refill_time) AS month
    FROM feed_refill_logs
    ORDER BY year DESC, month DESC, date DESC;
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Error fetching monthly feed logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Group by custom date range (from user input)
exports.getFeedRefillLogsByRange = async (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ error: "start_date and end_date are required" });
  }
  const query = `
    SELECT refill_time, amount_kg
    FROM feed_refill_logs
    WHERE refill_time BETWEEN ? AND ?
    ORDER BY refill_time ASC
  `;
  try {
    const [results] = await db.query(query, [start_date, end_date]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching feed logs by range:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
