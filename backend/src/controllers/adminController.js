const { pool } = require('../config/db');

async function listUsers(req, res) {
  const [users] = await pool.query(
    `SELECT id, name, email, role, grade, institution_id AS institutionId, status
     FROM users ORDER BY name`
  );
  res.json({ users });
}

async function getStats(req, res) {
  const [rows] = await pool.query('SELECT * FROM v_admin_user_stats');
  res.json({ stats: rows[0] });
}

async function changeUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido.' });
  }

  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  await pool.query(
    `INSERT INTO audit_logs (actor_id, action, target_user_id, details_json)
     VALUES (?, 'ROLE_CHANGE', ?, JSON_OBJECT('newRole', ?))`,
    [req.user.id, id, role]
  );

  res.json({ message: 'Rol actualizado.' });
}

async function toggleUserStatus(req, res) {
  const { id } = req.params;

  const [rows] = await pool.query('SELECT status FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const nextStatus = rows[0].status === 'active' ? 'inactive' : 'active';
  await pool.query('UPDATE users SET status = ? WHERE id = ?', [nextStatus, id]);
  await pool.query(
    `INSERT INTO audit_logs (actor_id, action, target_user_id, details_json)
     VALUES (?, 'STATUS_TOGGLE', ?, JSON_OBJECT('newStatus', ?))`,
    [req.user.id, id, nextStatus]
  );

  res.json({ message: 'Estado actualizado.', status: nextStatus });
}

async function listInstitutions(req, res) {
  const [institutions] = await pool.query('SELECT * FROM institutions ORDER BY name');
  res.json({ institutions });
}

async function createInstitution(req, res) {
  const { name, city, address, phone } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre de la institución es obligatorio.' });
  }
  const [result] = await pool.query(
    'INSERT INTO institutions (name, city, address, phone) VALUES (?, ?, ?, ?)',
    [name, city || null, address || null, phone || null]
  );
  res.status(201).json({ id: result.insertId });
}

module.exports = {
  listUsers,
  getStats,
  changeUserRole,
  toggleUserStatus,
  listInstitutions,
  createInstitution,
};
