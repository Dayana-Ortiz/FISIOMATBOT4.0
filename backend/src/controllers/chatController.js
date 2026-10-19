'use strict';
const { db, getUserId, getUserRole } = require('../services/chatDeps');
const llm = require('../services/llmService');
const { loadCurriculum, buildSystemPrompt, parseModelOutput } = require('../services/chatContextService');
const knowledge = require('../services/knowledgeService');
const actions = require('../services/actionService');

const MAX_MESSAGE_CHARS = 1000;

const dailyLimit = () => parseInt(process.env.CHAT_DAILY_MESSAGE_LIMIT || '40', 10);
const historyTurns = () => parseInt(process.env.CHAT_HISTORY_TURNS || '8', 10);

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
};

async function countToday(userId) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
       FROM chat_messages m
       JOIN chat_conversations c ON c.id = m.conversation_id
      WHERE c.user_id = ? AND m.role = 'user' AND m.created_at >= CURDATE()`,
    [userId]
  );
  return Number(rows[0].total);
}

/** Devuelve la conversación solo si es del usuario (o si es admin). */
async function getOwnedConversation(req, id) {
  const [rows] = await db.query('SELECT * FROM chat_conversations WHERE id = ? LIMIT 1', [id]);
  const conv = rows[0];
  if (!conv) return null;
  if (conv.user_id !== getUserId(req) && getUserRole(req) !== 'admin') return null;
  return conv;
}

async function listMessages(conversationId, limit = 50) {
  const [rows] = await db.query(
    `SELECT id, role, content, created_at AS createdAt
       FROM (SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?) t
      ORDER BY id ASC`,
    [conversationId, limit]
  );
  return rows;
}

// GET /api/chat/status
async function status(req, res, next) {
  try {
    const used = await countToday(getUserId(req));
    res.json({ enabled: llm.isEnabled(), dailyLimit: dailyLimit(), used, provider: llm.providerName() });
  } catch (err) {
    next(err);
  }
}

// POST /api/chat/conversations  { moduleId?, sectionId? }
async function openConversation(req, res, next) {
  try {
    const userId = getUserId(req);
    const moduleId = toIntOrNull(req.body && req.body.moduleId);
    const sectionId = toIntOrNull(req.body && req.body.sectionId);
    if (Number.isNaN(moduleId) || Number.isNaN(sectionId)) {
      return res.status(400).json({ message: 'moduleId o sectionId inválido.' });
    }

    const [existing] = await db.query(
      `SELECT * FROM chat_conversations
        WHERE user_id = ? AND module_id <=> ?
        ORDER BY updated_at DESC LIMIT 1`,
      [userId, moduleId]
    );

    let conv = existing[0];
    if (!conv) {
      const [result] = await db.query(
        'INSERT INTO chat_conversations (user_id, module_id, section_id) VALUES (?, ?, ?)',
        [userId, moduleId, sectionId]
      );
      const [created] = await db.query('SELECT * FROM chat_conversations WHERE id = ?', [result.insertId]);
      conv = created[0];
    } else if (sectionId !== conv.section_id) {
      await db.query('UPDATE chat_conversations SET section_id = ? WHERE id = ?', [sectionId, conv.id]);
      conv.section_id = sectionId;
    }

    const messages = await listMessages(conv.id);
    return res.json({
      conversation: { id: conv.id, moduleId: conv.module_id, sectionId: conv.section_id },
      messages,
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/chat/conversations/:id
async function getConversation(req, res, next) {
  try {
    const conv = await getOwnedConversation(req, Number(req.params.id));
    if (!conv) return res.status(404).json({ message: 'Conversación no encontrada.' });
    const messages = await listMessages(conv.id);
    return res.json({
      conversation: { id: conv.id, moduleId: conv.module_id, sectionId: conv.section_id },
      messages,
    });
  } catch (err) {
    return next(err);
  }
}

// POST /api/chat/conversations/:id/messages  { content }
async function sendMessage(req, res, next) {
  try {
    const userId = getUserId(req);

    const raw = req.body && req.body.content;
    if (typeof raw !== 'string' || !raw.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
    }
    const content = raw.trim();
    if (content.length > MAX_MESSAGE_CHARS) {
      return res.status(400).json({ message: `El mensaje supera ${MAX_MESSAGE_CHARS} caracteres.` });
    }

    const conv = await getOwnedConversation(req, Number(req.params.id));
    if (!conv) return res.status(404).json({ message: 'Conversación no encontrada.' });

    if (!llm.isEnabled()) {
      return res.status(503).json({ message: 'El asistente no está disponible por ahora.', code: 'CHAT_DISABLED' });
    }

    const used = await countToday(userId);
    if (used >= dailyLimit()) {
      return res.status(429).json({
        message: 'Alcanzaste el límite de mensajes de hoy. Vuelve mañana.',
        code: 'DAILY_LIMIT',
      });
    }

    // Historial reciente (solo los últimos N turnos) + mensaje nuevo
    const history = await listMessages(conv.id, historyTurns() * 2);
    const llmMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ];

    const [userRows] = await db.query('SELECT grade FROM users WHERE id = ? LIMIT 1', [userId]);
    const curriculum = await loadCurriculum(conv.module_id, conv.section_id);

    // RAG: recupera fragmentos relevantes de la base de conocimiento
    const kbChunks = knowledge.search(content, 4);
    const system = buildSystemPrompt(curriculum, userRows[0] && userRows[0].grade, kbChunks);

    let parsed;
    try {
      const raw = await llm.generateReply(llmMessages, { system, json: true });
      parsed = parseModelOutput(raw);
    } catch (err) {
      if (err instanceof llm.LlmError) {
        const code = err.code === 'LLM_DISABLED' ? 503 : 502;
        return res.status(code).json({ message: err.message, code: err.code });
      }
      throw err;
    }

    // Agente: ejecuta (si corresponde) la acción propuesta, validada y con el id del usuario autenticado
    const actionResult = await actions.execute(userId, parsed.action);
    const reply = actionResult ? `${parsed.reply}\n\n${actionResult.text}` : parsed.reply;

    // Solo se guarda si el LLM respondió bien
    const [uIns] = await db.query(
      "INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'user', ?)",
      [conv.id, content]
    );
    const [aIns] = await db.query(
      "INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
      [conv.id, reply]
    );
    await db.query('UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?', [conv.id]);

    const now = new Date().toISOString();
    return res.status(201).json({
      userMessage: { id: uIns.insertId, role: 'user', content, createdAt: now },
      assistantMessage: { id: aIns.insertId, role: 'assistant', content: reply, createdAt: now },
      remaining: Math.max(0, dailyLimit() - (used + 1)),
      sources: [...new Set(kbChunks.map((c) => c.title))],
      action: actionResult ? { name: actionResult.name, ok: actionResult.ok } : null,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { status, openConversation, getConversation, sendMessage };
