const { PrismaClient } = require("@prisma/client");

// Singleton Prisma Client instance for optimal DB connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

module.exports = prisma;
