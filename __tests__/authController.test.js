const authController = require("../controllers/authController");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

jest.mock("../config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("Auth Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, session: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should return 400 if required fields are missing", async () => {
      req.body = { email: "user@example.com" };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nama, email, dan password wajib diisi",
      });
    });

    it("should return 400 if email is already registered", async () => {
      req.body = { name: "Test User", email: "existing@example.com", password: "password123" };
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: "existing@example.com" });

      await authController.register(req, res, next);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "existing@example.com" },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email sudah terdaftar" });
    });

    it("should hash password and create user successfully", async () => {
      req.body = { name: "Test User", email: "new@example.com", password: "password123" };
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_password_123");
      prisma.user.create.mockResolvedValue({
        id: 2,
        name: "Test User",
        email: "new@example.com",
        role: "user",
      });

      await authController.register(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "Test User",
          email: "new@example.com",
          password: "hashed_password_123",
          role: "user",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Registrasi berhasil",
        user: { id: 2, name: "Test User", email: "new@example.com", role: "user" },
      });
    });
  });

  describe("login", () => {
    it("should return 401 if user is not found", async () => {
      req.body = { email: "notfound@example.com", password: "password123" };
      prisma.user.findUnique.mockResolvedValue(null);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Email tidak ditemukan" });
    });

    it("should return 401 if password does not match", async () => {
      req.body = { email: "user@example.com", password: "wrongpassword" };
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: "user@example.com", password: "hash" });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Password salah" });
    });

    it("should create session and return 200 on successful login", async () => {
      req.body = { email: "user@example.com", password: "correctpassword" };
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: "User",
        email: "user@example.com",
        password: "hash",
        role: "user",
      });
      bcrypt.compare.mockResolvedValue(true);

      await authController.login(req, res, next);

      expect(req.session.user).toEqual({
        id: 1,
        name: "User",
        email: "user@example.com",
        role: "user",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Login berhasil",
        user: req.session.user,
      });
    });
  });
});
