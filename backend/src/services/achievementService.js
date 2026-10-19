const { pool } = require('../config/db');

/**
 * Otorga un logro del catálogo `achievements` (por su code) si el usuario aún no lo tiene.
 * Devuelve el título del logro si es nuevo, o null si ya lo tenía o el código no existe.
 */
async function award(userId, code) {
  const [result] = await pool.query(
    `INSERT IGNORE INTO user_achievements (user_id, achievement_id)
     SELECT ?, id FROM achievements WHERE code = ?`,
    [userId, code]
  );
  if (!result.affectedRows) return null;
  const [rows] = await pool.query('SELECT title FROM achievements WHERE code = ?', [code]);
  return rows[0] ? rows[0].title : null;
}

module.exports = { award };
