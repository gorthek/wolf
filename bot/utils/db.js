const mysql = require('mysql2/promise');

// Pool de connexions MySQL — Railway injecte MYSQLHOST/MYSQLUSER/etc. automatiquement
const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
  user:     process.env.MYSQLUSER     || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME     || 'vocal_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connexion MySQL établie');
    conn.release();
  } catch (err) {
    console.error('❌ Erreur MySQL :', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
