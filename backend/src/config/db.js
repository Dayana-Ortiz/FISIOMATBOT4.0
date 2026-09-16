const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway expone la cadena de conexión completa (DATABASE_URL / MYSQL_URL).
// En local (XAMPP) normalmente se usan variables sueltas (DB_HOST, DB_USER, ...).
const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const pool = connectionUrl
  ? mysql.createPool(connectionUrl + '?dateStrings=true')
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fisiomathbot',
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    });

async function checkConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkConnection };
