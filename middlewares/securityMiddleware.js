const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// General API rate limiter (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak permintaan dari IP ini, coba lagi dalam 15 menit." },
});

// Strict auth rate limiter for login/register (10 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak percobaan login/registrasi, coba lagi nanti." },
});

// Helmet security headers middleware setup
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Turned off for dev API endpoints, configurable
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

module.exports = {
  apiLimiter,
  authLimiter,
  securityHeaders,
};
