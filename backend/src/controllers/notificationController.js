const { pool } = require('../config/db');

async function listMyNotifications(req, res) {
  const [notifications] = await pool.query(
    'SELECT id, title, message, kind, is_read AS isRead, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.user.id]
  );
  res.json({ notifications });
}

async function markAllRead(req, res) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'Notificaciones marcadas como leídas.' });
}

module.exports = { listMyNotifications, markAllRead };
