const { createLog } = require("../controllers/weightLogsController");
const prisma = require("../config/prisma");

jest.mock("../config/prisma", () => ({
  chickenWeightLog: {
    create: jest.fn(),
  },
}));

describe("weightLogsController - createLog (Scale Hardware Payloads)", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should successfully save log when hardware sends 'weight_grams'", async () => {
    req.body = { weight_grams: 350.5 };
    prisma.chickenWeightLog.create.mockResolvedValue({
      id: 1,
      weightGrams: 350.5,
      weighTime: new Date("2026-08-03T00:00:00Z"),
    });

    await createLog(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        weight_grams: 350.5,
      })
    );
  });

  test("should successfully save log when hardware sends 'weight' or 'berat'", async () => {
    req.body = { berat: 420 };
    prisma.chickenWeightLog.create.mockResolvedValue({
      id: 2,
      weightGrams: 420,
      weighTime: new Date("2026-08-03T00:00:00Z"),
    });

    await createLog(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        weight_grams: 420,
      })
    );
  });

  test("should successfully save log when hardware sends a raw numeric string '250'", async () => {
    req.body = "250";
    prisma.chickenWeightLog.create.mockResolvedValue({
      id: 3,
      weightGrams: 250,
      weighTime: new Date("2026-08-03T00:00:00Z"),
    });

    await createLog(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        weight_grams: 250,
      })
    );
  });

  test("should return 400 with helpful payload hint if no valid weight field is provided", async () => {
    req.body = { invalidField: "foo" };

    await createLog(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("tidak ditemukan"),
      })
    );
  });
});
