const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const achievements = require('../services/achievementService');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    grade: user.grade,
    institutionId: user.institution_id,
    avatar: user.avatar_url,
  };
}

/** Grado escolar: null si viene vacío, NaN si no es 9, 10 u 11. */
function parseGrade(value) {
  if (value === undefined || value === null || value === '') return null;
  const grade = Number(value);
  return [9, 10, 11].includes(grade) ? grade : NaN;
}

/** Devuelve el id de la institución con ese nombre (la crea si no existe), o null si viene vacío. */
async function findOrCreateInstitution(name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  const [instRows] = await pool.query('SELECT id FROM institutions WHERE name = ?', [clean]);
  if (instRows.length > 0) return instRows[0].id;
  const [insertResult] = await pool.query('INSERT INTO institutions (name) VALUES (?)', [clean]);
  return insertResult.insertId;
}

async function register(req, res) {
  const { password, institution } = req.body;
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const grade = parseGrade(req.body.grade);

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
  }
  if (Number.isNaN(grade)) {
    return res.status(400).json({ message: 'El grado debe ser 9, 10 u 11.' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const institutionId = await findOrCreateInstitution(institution);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, grade, institution_id)
     VALUES (?, ?, ?, 'student', ?, ?)`,
    [name, email, passwordHash, grade, institutionId]
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  const user = rows[0];
  const token = signToken(user);

  res.status(201).json({ token, user: toPublicUser(user) });
}

async function login(req, res) {
  const { password } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || user.status !== 'active') {
    return res.status(401).json({ message: 'Credenciales inválidas o cuenta inactiva.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  await achievements.award(user.id, 'FIRST_LOGIN');

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
}

async function me(req, res) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  res.json({ user: toPublicUser(rows[0]) });
}

module.exports = { register, login, me, signToken, toPublicUser, findOrCreateInstitution, parseGrade };
