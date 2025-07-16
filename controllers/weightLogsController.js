const db = require("../db/connection");

// Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM chicken_weight_logs ORDER BY weigh_time DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logs per week
exports.getLogsPerWeek = async (req, res) => {
  try {
    const [rows] = await db.query(`
           SELECT 
  DATE(weigh_time) AS date,
  weight_grams,
  YEAR(weigh_time) AS year,
  MONTH(weigh_time) AS month,

  CEIL(
    (DAY(weigh_time) + 
     WEEKDAY(DATE_FORMAT(weigh_time, '%Y-%m-01'))
    ) / 7
  ) AS week_of_month

FROM chicken_weight_logs
ORDER BY year DESC, month DESC, week_of_month DESC, date DESC;

        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logs per month
exports.getLogsPerMonth = async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT 
  DATE(weigh_time) AS date,
  weight_grams,
  YEAR(weigh_time) AS year,
  MONTH(weigh_time) AS month
FROM chicken_weight_logs
ORDER BY year DESC, month DESC, date DESC;

        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logs by custom date range
exports.getLogsByRange = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }
  try {
    const [rows] = await db.query(
      "SELECT * FROM chicken_weight_logs WHERE weigh_time BETWEEN ? AND ? ORDER BY weigh_time DESC",
      [start, end]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Post new log
exports.createLog = async (req, res) => {
  const { weight_grams } = req.body;
  if (!weight_grams) {
    return res.status(400).json({ error: "weight_grams is required" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO chicken_weight_logs (weight_grams) VALUES (?)",
      [weight_grams]
    );
    res.status(201).json({ id: result.insertId, weight_grams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
