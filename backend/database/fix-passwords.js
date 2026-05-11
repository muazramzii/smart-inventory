// database/fix-passwords.js
// ----------------------------------------------------------------------------
// One-time helper: regenerate bcrypt hashes for the seeded users and write
// them back to the database. Run with:  node database/fix-passwords.js
// ----------------------------------------------------------------------------

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const staffHash = await bcrypt.hash('Staff@123', 10);

  await conn.query(
    'UPDATE users SET password_hash = ?, is_active = 1 WHERE email = ?',
    [adminHash, 'admin@inventory.local']
  );
  await conn.query(
    'UPDATE users SET password_hash = ?, is_active = 1 WHERE email = ?',
    [staffHash, 'staff@inventory.local']
  );

  console.log('✅ Updated admin@inventory.local with hash:', adminHash);
  console.log('✅ Updated staff@inventory.local with hash:', staffHash);

  // Verify by re-comparing
  const [rows] = await conn.query(
    'SELECT email, password_hash, is_active FROM users WHERE email IN (?, ?)',
    ['admin@inventory.local', 'staff@inventory.local']
  );
  for (const row of rows) {
    const ok =
      row.email === 'admin@inventory.local'
        ? await bcrypt.compare('Admin@123', row.password_hash)
        : await bcrypt.compare('Staff@123', row.password_hash);
    console.log(
      `   ${row.email}  is_active=${row.is_active}  password_match=${ok}`
    );
  }

  await conn.end();
  console.log('Done.');
})().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});