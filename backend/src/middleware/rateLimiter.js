const rateLimit = require("express-rate-limit");
// const { RedisStore } = require("rate-limit-redis");
// const Redis = require("ioredis");

// // Setup redis client
// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// redisClient.on('error', (err) => {
//   console.error('Redis connection error (rate limit fallback to memory):', err);
// });

// const getStore = () => {
//   if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
//     return new RedisStore({
//       sendCommand: (...args) => redisClient.call(...args),
//     });
//   }
//   // Fallback to memory store if Redis is unavailable
//   return undefined;
// };

// Global rate limiter: 100 requests / 15 minutes
const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  // store: getStore(), // Commented out redis
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});

// Auth routes rate limiter: strict in prod, relaxed in dev
const authLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // no practical limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  // store: getStore(), // Commented out redis
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many authentication attempts, please try again later.' });
  }
});

module.exports = { globalLimiter, authLimiter };
