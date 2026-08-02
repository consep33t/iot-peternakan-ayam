const prisma = require("../config/prisma");

// Get all logs
exports.getAllLogs = async (req, res, next) => {
  try {
    const logs = await prisma.chickenWeightLog.findMany({
      orderBy: { weighTime: "desc" },
    });
    res.json(
      logs.map((item) => ({
        id: item.id,
        weight_grams: item.weightGrams,
        weigh_time: item.weighTime,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Get logs per week
exports.getLogsPerWeek = async (req, res, next) => {
  try {
    const logs = await prisma.chickenWeightLog.findMany({
      orderBy: { weighTime: "desc" },
    });

    const results = logs.map((log) => {
      const d = new Date(log.weighTime);
      return {
        date: log.weighTime,
        weight_grams: log.weightGrams,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        week_of_month: Math.ceil(d.getDate() / 7),
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Get logs per month
exports.getLogsPerMonth = async (req, res, next) => {
  try {
    const logs = await prisma.chickenWeightLog.findMany({
      orderBy: { weighTime: "desc" },
    });

    const results = logs.map((log) => {
      const d = new Date(log.weighTime);
      return {
        date: log.weighTime,
        weight_grams: log.weightGrams,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Get logs by custom date range
exports.getLogsByRange = async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }

  try {
    const logs = await prisma.chickenWeightLog.findMany({
      where: {
        weighTime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: { weighTime: "desc" },
    });

    res.json(
      logs.map((item) => ({
        id: item.id,
        weight_grams: item.weightGrams,
        weigh_time: item.weighTime,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Post new log (Supports weight_grams, weightGrams, weight, berat, gram, val, value, or raw numbers)
exports.createLog = async (req, res, next) => {
  try {
    let body = req.body;

    // Handle plain string or stringified JSON body from microcontrollers
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        if (!isNaN(parseFloat(body))) {
          body = { weight_grams: parseFloat(body) };
        }
      }
    }

    const rawWeight =
      body?.weight_grams ??
      body?.weightGrams ??
      body?.weight ??
      body?.berat ??
      body?.gram ??
      body?.weight_gram ??
      body?.val ??
      body?.value ??
      (typeof body === "number" ? body : null);

    const parsedWeight = parseFloat(rawWeight);

    if (
      rawWeight === undefined ||
      rawWeight === null ||
      rawWeight === "" ||
      isNaN(parsedWeight)
    ) {
      return res.status(400).json({
        error: "Parameter weight (berat) tidak ditemukan atau bernilai invalid.",
        accepted_fields: [
          "weight_grams",
          "weightGrams",
          "weight",
          "berat",
          "gram",
          "val",
          "value",
        ],
        received: req.body,
      });
    }

    const newLog = await prisma.chickenWeightLog.create({
      data: {
        weightGrams: parsedWeight,
      },
    });

    res.status(201).json({
      success: true,
      message: "Catatan berat timbangan berhasil disimpan",
      id: newLog.id,
      weight_grams: newLog.weightGrams,
      weightGrams: newLog.weightGrams,
      weigh_time: newLog.weighTime,
      weighTime: newLog.weighTime,
    });
  } catch (err) {
    next(err);
  }
};
