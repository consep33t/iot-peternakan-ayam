const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "iot_ayam",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB Connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database MySQL connected successfully pool");
    connection.release();
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
  }
})();

module.exports = db;
