// src/config/db.js
// ----------------------------------------------------------------------------
// MySQL connection pool. We export the pool's promise interface so we can use
// async/await everywhere. One pool is shared across the whole app.
// ----------------------------------------------------------------------------

const mysql = require('mysql2');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log(`✅ Database connected: ${config.db.database}@${config.db.host}:${config.db.port}`);
  connection.release();
});

module.exports = pool.promise();
