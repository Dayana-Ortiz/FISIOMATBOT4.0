/**
 * Ejecuta database/schema.sql (y opcionalmente database/seed.sql) contra la
 * base de datos configurada en las variables de entorno.
 *
 * Uso:
 *   npm run migrate              -> esquema completo (BORRA y recrea las tablas)
 *   npm run migrate -- --seed    -> esquema + datos de ejemplo
 *   npm run migrate -- --upgrade -> actualiza una base existente SIN borrar datos
 *                                   (tablas del chat, columna sections.lesson_key, lecciones y quizzes iniciales)
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DATABASE_DIR = path.resolve(__dirname, '..', '..', '..', 'database');

// Con DATABASE_URL (Railway) la base es la de la URL (p. ej. "railway"); se quitan los
// CREATE DATABASE / USE fisiomathbot de los .sql para que las tablas queden donde se conecta el backend.
const stripDatabaseSelection = (sql) =>
  sql.replace(/^\s*CREATE DATABASE[\s\S]*?;\s*$/gim, '').replace(/^\s*USE\s+\S+\s*;\s*$/gim, '');

async function runSqlFile(connection, filePath, useUrlDatabase) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const sql = useUrlDatabase ? stripDatabaseSelection(raw) : raw;
  console.log(`Ejecutando ${path.basename(filePath)}...`);
  await connection.query(sql);
}

// Bases creadas antes de existir sections.lesson_key: se agrega la columna (sin tocar los datos).
async function ensureLessonKeyColumn(connection) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sections' AND COLUMN_NAME = 'lesson_key'`
  );
  if (rows.length > 0) return;
  console.log('Agregando la columna sections.lesson_key...');
  await connection.query(
    `ALTER TABLE sections
       ADD COLUMN lesson_key VARCHAR(50) NULL AFTER module_id,
       ADD UNIQUE KEY uq_sections_module_lesson (module_id, lesson_key)`
  );
}

async function main() {
  const withSeed = process.argv.includes('--seed');
  const upgrade = process.argv.includes('--upgrade');
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  const connectionConfig = connectionUrl
    ? connectionUrl + '?multipleStatements=true'
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        // schema.sql crea la base y hace USE; en --upgrade la base ya existe
        ...(upgrade ? { database: process.env.DB_NAME || 'fisiomathbot' } : {}),
        multipleStatements: true,
      };

  const connection = await mysql.createConnection(connectionConfig);

  try {
    const useUrlDatabase = Boolean(connectionUrl);
    if (!upgrade) {
      await runSqlFile(connection, path.join(DATABASE_DIR, 'schema.sql'), useUrlDatabase);
    }
    // Tablas del chat tutor (CREATE IF NOT EXISTS: conservan el historial entre migraciones)
    await runSqlFile(connection, path.join(DATABASE_DIR, 'chat_tutor.sql'), useUrlDatabase);
    await runSqlFile(connection, path.join(DATABASE_DIR, 'chat_tutor_v2.sql'), useUrlDatabase);
    if (withSeed && !upgrade) {
      await runSqlFile(connection, path.join(DATABASE_DIR, 'seed.sql'), useUrlDatabase);
    }
    // Catálogo de lecciones que cuentan para el progreso (idempotente)
    await ensureLessonKeyColumn(connection);
    await runSqlFile(connection, path.join(DATABASE_DIR, 'lessons.sql'), useUrlDatabase);
    // Preguntas iniciales de los quizzes (idempotente; después las gestionan los profesores)
    await runSqlFile(connection, path.join(DATABASE_DIR, 'quizzes.sql'), useUrlDatabase);
    console.log(upgrade ? 'Actualización completada con éxito.' : 'Migración completada con éxito.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Error ejecutando la migración:', err.message);
  process.exit(1);
});
