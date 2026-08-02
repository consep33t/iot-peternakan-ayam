const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

// Register user with Prisma ORM
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    next(err);
  }
};

// Login user with Prisma ORM
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ message: "Login berhasil", user: req.session.user });
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Gagal logout" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout berhasil" });
  });
};

// Get current session
exports.getSession = (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Belum login" });
  }
};
