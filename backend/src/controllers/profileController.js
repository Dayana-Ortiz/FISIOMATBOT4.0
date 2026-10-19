const { pool } = require('../config/db');
const { signToken, toPublicUser, findOrCreateInstitution, parseGrade } = require('./authController');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BIO = 500;

async function loadProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.*, i.name AS institution_name
     FROM users u
     LEFT JOIN institutions i ON i.id = u.institution_id
     WHERE u.id = ?`,
    [userId]
  );
  const user = rows[0];
  if (!user) return null;

  const [stats] = await pool.query('SELECT * FROM v_user_profile_stats WHERE user_id = ?', [userId]);
  const s = stats[0] || {};

  return {
    user,
    profile: {
      ...toPublicUser(user),
      institution: user.institution_name,
      bio: user.bio,
      status: user.status,
      createdAt: user.created_at,
    },
    stats: {
      completedLessons: Number(s.completed_lessons || 0),
      totalScore: Number(s.total_score || 0),
      achievements: Number(s.achievements_count || 0),
    },
  };
}

// GET /api/profile/me
async function getMyProfile(req, res) {
  const data = await loadProfile(req.user.id);
  if (!data) return res.status(404).json({ message: 'Usuario no encontrado.' });
  res.json({ profile: data.profile, stats: data.stats });
}

// PUT /api/profile/me  { name, email, grade, institution, bio }
async function updateMyProfile(req, res) {
  const userId = req.user.id;
  const body = req.body || {};

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const institution = String(body.institution || '').trim();
  const bio = String(body.bio || '').trim();
  const grade = parseGrade(body.grade);

  if (!name || name.length > 120) {
    return res.status(400).json({ message: 'El nombre es obligatorio (máximo 120 caracteres).' });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 150) {
    return res.status(400).json({ message: 'Ingresa un correo electrónico válido.' });
  }
  if (Number.isNaN(grade)) {
    return res.status(400).json({ message: 'El grado debe ser 9, 10 u 11.' });
  }
  if (institution.length > 150) {
    return res.status(400).json({ message: 'El nombre de la institución es demasiado largo (máximo 150 caracteres).' });
  }
  if (bio.length > MAX_BIO) {
    return res.status(400).json({ message: `La biografía no puede superar ${MAX_BIO} caracteres.` });
  }

  const [taken] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, userId]);
  if (taken.length > 0) {
    return res.status(409).json({ message: 'Ese correo ya está registrado en otra cuenta.' });
  }

  // El grado solo aplica a estudiantes
  const finalGrade = req.user.role === 'student' ? grade : null;
  const institutionId = await findOrCreateInstitution(institution);

  await pool.query(
    'UPDATE users SET name = ?, email = ?, grade = ?, institution_id = ?, bio = ? WHERE id = ?',
    [name, email, finalGrade, institutionId, bio || null, userId]
  );

  const data = await loadProfile(userId);
  // El token lleva nombre y correo: se emite uno nuevo para que coincidan con los datos guardados.
  res.json({ profile: data.profile, stats: data.stats, token: signToken(data.user) });
}

module.exports = { getMyProfile, updateMyProfile };
