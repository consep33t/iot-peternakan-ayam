const prisma = require("../config/prisma");

// Get all feed refill logs
exports.getFeedRefillLogs = async (req, res, next) => {
  try {
    const logs = await prisma.feedRefillLog.findMany({
      orderBy: { refillTime: "desc" },
    });
    // Map to API JSON structure expected by frontend
    res.json(
      logs.map((item) => ({
        id: item.id,
        amount_kg: item.amountKg,
        refill_time: item.refillTime,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Add new log (Supports amount_kg, amountKg, amount, refill, jumlah, pakan, val, value, or raw numbers)
exports.addFeedRefillLog = async (req, res, next) => {
  try {
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        if (!isNaN(parseFloat(body))) {
          body = { amount_kg: parseFloat(body) };
        }
      }
    }

    const rawAmount =
      body?.amount_kg ??
      body?.amountKg ??
      body?.amount ??
      body?.refill ??
      body?.jumlah ??
      body?.pakan ??
      body?.val ??
      body?.value ??
      (typeof body === "number" ? body : null);

    const parsedAmount = parseFloat(rawAmount);

    if (
      rawAmount === undefined ||
      rawAmount === null ||
      rawAmount === "" ||
      isNaN(parsedAmount)
    ) {
      return res.status(400).json({
        error: "Parameter amount_kg (pakan) tidak ditemukan atau bernilai invalid.",
        accepted_fields: [
          "amount_kg",
          "amountKg",
          "amount",
          "refill",
          "jumlah",
          "pakan",
          "val",
          "value",
        ],
        received: req.body,
      });
    }

    const newLog = await prisma.feedRefillLog.create({
      data: {
        amountKg: parsedAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: "Feed refill log added successfully",
      logId: newLog.id,
      amount_kg: newLog.amountKg,
      amountKg: newLog.amountKg,
      refill_time: newLog.refillTime,
    });
  } catch (err) {
    next(err);
  }
};

// Group by week
exports.getFeedRefillLogsWeekly = async (req, res, next) => {
  try {
    const logs = await prisma.feedRefillLog.findMany({
      orderBy: { refillTime: "desc" },
    });

    const results = logs.map((log) => {
      const d = new Date(log.refillTime);
      return {
        date: log.refillTime,
        amount_kg: log.amountKg,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        week_of_month: Math.floor((d.getDate() - 1) / 7) + 1,
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Group by month
exports.getFeedRefillLogsMonthly = async (req, res, next) => {
  try {
    const logs = await prisma.feedRefillLog.findMany({
      orderBy: { refillTime: "desc" },
    });

    const results = logs.map((log) => {
      const d = new Date(log.refillTime);
      return {
        date: log.refillTime,
        amount_kg: log.amountKg,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Group by custom date range
exports.getFeedRefillLogsByRange = async (req, res, next) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ error: "start_date and end_date are required" });
  }

  try {
    const logs = await prisma.feedRefillLog.findMany({
      where: {
        refillTime: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      },
      orderBy: { refillTime: "asc" },
    });

    res.json(
      logs.map((item) => ({
        refill_time: item.refillTime,
        amount_kg: item.amountKg,
      }))
    );
  } catch (err) {
    next(err);
  }
};
