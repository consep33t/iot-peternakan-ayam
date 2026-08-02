const scheduleController = require("../controllers/scheduleController");
const prisma = require("../config/prisma");

jest.mock("../config/prisma", () => ({
  schedule: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Schedule Controller Unit Tests", () => {
  let req, res, next, mockMqttClient;

  beforeEach(() => {
    mockMqttClient = { publish: jest.fn() };
    req = {
      body: {},
      params: {},
      app: { get: jest.fn().mockReturnValue(mockMqttClient) },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getSchedules", () => {
    it("should fetch all schedules ordered by hour and minute", async () => {
      const mockSchedules = [
        { id: 1, type: "pakan_pagi", hour: 6, minute: 0, enabled: true },
        { id: 2, type: "pakan_sore", hour: 17, minute: 30, enabled: true },
      ];
      prisma.schedule.findMany.mockResolvedValue(mockSchedules);

      await scheduleController.getSchedules(req, res, next);

      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        orderBy: [{ hour: "asc" }, { minute: "asc" }],
      });
      expect(res.json).toHaveBeenCalledWith(mockSchedules);
    });
  });

  describe("createSchedule", () => {
    it("should create schedule and publish MQTT message", async () => {
      req.body = { type: "pakan_pagi", hour: "7", minute: "15" };
      const createdSchedule = { id: 3, type: "pakan_pagi", hour: 7, minute: 15, enabled: true };
      prisma.schedule.create.mockResolvedValue(createdSchedule);

      await scheduleController.createSchedule(req, res, next);

      expect(prisma.schedule.create).toHaveBeenCalledWith({
        data: { type: "pakan_pagi", hour: 7, minute: 15, enabled: true },
      });
      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        "iot/ayam/schedule_pakan_pagi",
        JSON.stringify({ start_hour: 7, start_minute: 15 })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, schedule: createdSchedule });
    });
  });

  describe("enableSchedule", () => {
    it("should update enabled state to true and publish MQTT message", async () => {
      req.params = { id: "1" };
      const updatedSchedule = { id: 1, type: "pakan_pagi", hour: 6, minute: 0, enabled: true };
      prisma.schedule.update.mockResolvedValue(updatedSchedule);

      await scheduleController.enableSchedule(req, res, next);

      expect(prisma.schedule.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { enabled: true },
      });
      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        "iot/ayam/schedule_pakan_pagi",
        JSON.stringify({ start_hour: 6, start_minute: 0 })
      );
      expect(res.json).toHaveBeenCalledWith({ success: true, schedule: updatedSchedule });
    });
  });

  describe("deleteSchedule", () => {
    it("should delete schedule by id", async () => {
      req.params = { id: "2" };
      prisma.schedule.delete.mockResolvedValue({});

      await scheduleController.deleteSchedule(req, res, next);

      expect(prisma.schedule.delete).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
