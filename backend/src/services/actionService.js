'use strict';
/**
 * Acciones que el agente puede ejecutar (CRUD controlado).
 * El LLM solo PROPONE una acción {name, args}; el backend la valida contra una lista
 * blanca y la ejecuta con el id del usuario autenticado (nunca el que diga el modelo).
 */
const { db } = require('./chatDeps');

const MAX_OPEN_TICKETS = 10;

const ACTIONS = {
  // CREATE
  async create_ticket({ userId, args }) {
    const subject = String(args.subject || '').trim().slice(0, 120);
    const description = String(args.description || '').trim().slice(0, 1000);
    if (subject.length < 5 || description.length < 10) {
      return { ok: false, text: 'Faltan datos: necesito un asunto y una descripción más claros para el reporte.' };
    }
    const [open] = await db.query(
      "SELECT COUNT(*) AS total FROM chat_support_tickets WHERE user_id = ? AND status = 'abierto'",
      [userId]
    );
    if (Number(open[0].total) >= MAX_OPEN_TICKETS) {
      return { ok: false, text: `Ya tienes ${MAX_OPEN_TICKETS} reportes abiertos. Cancela alguno antes de crear otro.` };
    }
    const [res] = await db.query(
      'INSERT INTO chat_support_tickets (user_id, subject, description) VALUES (?, ?, ?)',
      [userId, subject, description]
    );
    return { ok: true, text: `Reporte #${res.insertId} creado: "${subject}". Estado: abierto.` };
  },

  // READ
  async list_my_tickets({ userId }) {
    const [rows] = await db.query(
      'SELECT id, subject, status FROM chat_support_tickets WHERE user_id = ? ORDER BY id DESC LIMIT 10',
      [userId]
    );
    if (!rows.length) return { ok: true, text: 'No tienes reportes registrados.' };
    return { ok: true, text: 'Tus reportes:\n' + rows.map((r) => `#${r.id} · ${r.subject} (${r.status})`).join('\n') };
  },

  // READ
  async list_modules() {
    const [rows] = await db.query('SELECT * FROM modules LIMIT 20');
    if (!rows.length) return { ok: true, text: 'No hay módulos publicados todavía.' };
    const names = rows.map((r) => r.title || r.name || r.titulo || `Módulo ${r.id}`);
    return { ok: true, text: 'Módulos disponibles:\n' + names.map((n) => `• ${n}`).join('\n') };
  },

  // UPDATE (cancelar) — solo tickets propios y abiertos
  async cancel_ticket({ userId, args }) {
    const id = Number(args.id);
    if (!Number.isInteger(id) || id <= 0) return { ok: false, text: 'Indica el número del reporte que quieres cancelar.' };
    const [res] = await db.query(
      "UPDATE chat_support_tickets SET status = 'cancelado' WHERE id = ? AND user_id = ? AND status = 'abierto'",
      [id, userId]
    );
    return res.affectedRows
      ? { ok: true, text: `Reporte #${id} cancelado.` }
      : { ok: false, text: `No encontré un reporte abierto #${id} a tu nombre.` };
  },
};

const ACTION_NAMES = Object.keys(ACTIONS);

async function execute(userId, action) {
  if (!action || typeof action.name !== 'string' || !ACTION_NAMES.includes(action.name)) return null;
  const args = action.args && typeof action.args === 'object' ? action.args : {};
  try {
    const out = await ACTIONS[action.name]({ userId, args });
    return { name: action.name, ...out };
  } catch (err) {
    console.error('[chat] error ejecutando acción', action.name, err.code || err.name);
    return { name: action.name, ok: false, text: 'No pude completar la acción en este momento. Intenta de nuevo más tarde.' };
  }
}

module.exports = { execute, ACTION_NAMES };
