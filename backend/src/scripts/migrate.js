/**
 * Ejecuta database/schema.sql (y opcionalmente database/seed.sql) contra la
 * base de datos configurada en las variables de entorno.
 *
 * Uso:
 *   npm run migrate            -> solo esquema
 *   npm run migrate -- --seed  -> esquema + datos de ejemplo
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DATABASE_DIR = path.resolve(__dirname, '..', '..', '..', 'database');

async function runSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Ejecutando ${path.basename(filePath)}...`);
  await connection.query(sql);
}

async function main() {
  const withSeed = process.argv.includes('--seed');
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  const connectionConfig = connectionUrl
    ? connectionUrl + '?multipleStatements=true'
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
      };

  const connection = await mysql.createConnection(connectionConfig);

  try {
    await runSqlFile(connection, path.join(DATABASE_DIR, 'schema.sql'));
    // Tablas del chat tutor (CREATE IF NOT EXISTS: conservan el historial entre migraciones)
    await runSqlFile(connection, path.join(DATABASE_DIR, 'chat_tutor.sql'));
    await runSqlFile(connection, path.join(DATABASE_DIR, 'chat_tutor_v2.sql'));
    if (withSeed) {
      await runSqlFile(connection, path.join(DATABASE_DIR, 'seed.sql'));
    }
    console.log('Migración completada con éxito.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Error ejecutando la migración:', err.message);
  process.exit(1);
});
