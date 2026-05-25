const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  user:     process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME     || 'vocal_tracker',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test de connexion au démarrage
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connecté avec succès');
    console.log('Host:', process.env.MYSQLHOST || process.env.DB_HOST);
    console.log('Database:', process.env.MYSQLDATABASE || process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur MySQL complète:', JSON.stringify({
      message: err.message,
      code: err.code,
      errno: err.errno,
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    }, null, 2));
  });

module.exports = pool;
