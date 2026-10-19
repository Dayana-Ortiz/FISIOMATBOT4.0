'use strict';
/**
 * ÚNICO archivo del chat que debes adaptar a tu backend.
 * Ajusta las rutas de import y los nombres según tu proyecto.
 */

// Pool de mysql2 con API de promesas (mysql2/promise): config/db.js exporta { pool, checkConnection }
const { pool: db } = require('../config/db');

// Middleware JWT que deja el usuario en req.user = { id, role, name, email }
const { authenticate } = require('../middleware/auth');

// Cómo sacar id y rol del payload del JWT
const getUserId = (req) => (req.user ? req.user.id : undefined);
const getUserRole = (req) => (req.user ? req.user.role : undefined);

module.exports = { db, authenticate, getUserId, getUserRole };
