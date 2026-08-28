// src/config/env.js
// ----------------------------------------------------------------------------
// Loads environment variables from .env, validates them, and exports a frozen
// config object. Crash early on missing required vars instead of failing later
// with a confusing runtime error.
// ----------------------------------------------------------------------------

require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key] && process.env[key] !== '');

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Please check your .env file.');
  process.exit(1);
}

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
});

module.exports = config;
