'use strict';
/**
 * Prueba de humo del agente SIN base de datos real ni API key:
 *  - simula la BD en memoria y la API de Gemini (fetch)
 *  - verifica RAG en el prompt, acciones CRUD, validación de acciones y filtro anti-respuestas
 * Uso: node backend/scripts/chatSmoke.js
 */
const Module = require('module');
const assert = require('assert');

// ---------- BD simulada ----------
const tickets = [];
const messages = [];
const fakeDb = {
  async query(sql, params = []) {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (s.startsWith('SELECT * FROM chat_conversations WHERE id')) return [[{ id: 1, user_id: 7, module_id: 1, section_id: 2 }]];
    if (s.includes('FROM chat_messages m JOIN')) return [[{ total: 0 }]];
    if (s.includes('FROM (SELECT * FROM chat_messages')) return [messages.slice(-6)];
    if (s.startsWith('SELECT grade FROM users')) return [[{ grade: 11 }]];
    if (s.startsWith('SELECT * FROM modules WHERE id')) return [[{ id: 1, title: 'Energía mecánica' }]];
    if (s.startsWith('SELECT * FROM sections WHERE id'))
      return [[{ id: 2, title: 'Energía potencial', content: JSON.stringify({ text: 'Ep = m g h', quiz: { correctAnswer: 'B', isCorrect: true } }) }]];
    if (s.startsWith('SELECT * FROM modules LIMIT')) return [[{ id: 1, title: 'Energía mecánica' }, { id: 2, name: 'Álgebra' }]];
    if (s.includes("COUNT(*) AS total FROM chat_support_tickets")) return [[{ total: tickets.filter((t) => t.status === 'abierto').length }]];
    if (s.startsWith('INSERT INTO chat_support_tickets')) {
      tickets.push({ id: tickets.length + 1, user_id: params[0], subject: params[1], description: params[2], status: 'abierto' });
      return [{ insertId: tickets.length }];
    }
    if (s.startsWith('SELECT id, subject, status FROM chat_support_tickets')) return [tickets.filter((t) => t.user_id === params[0])];
    if (s.startsWith("UPDATE chat_support_tickets SET status = 'cancelado'")) {
      const t = tickets.find((x) => x.id === params[0] && x.user_id === params[1] && x.status === 'abierto');
      if (t) t.status = 'cancelado';
      return [{ affectedRows: t ? 1 : 0 }];
    }
    if (s.startsWith('INSERT INTO chat_messages')) {
      messages.push({ id: messages.length + 1, role: s.includes("'user'") ? 'user' : 'assistant', content: params[1] });
      return [{ insertId: messages.length }];
    }
    if (s.startsWith('UPDATE chat_conversations SET updated_at')) return [{}];
    throw new Error('SQL no simulado: ' + s.slice(0, 80));
  },
};

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === './chatDeps' || request === '../services/chatDeps') {
    return { db: fakeDb, authenticate: (q, r, n) => n(), getUserId: (req) => req.user.id, getUserRole: (req) => req.user.role };
  }
  return origLoad.call(this, request, ...rest);
};

process.env.LLM_PROVIDER = 'gemini';
process.env.GEMINI_API_KEY = 'test-key';
process.env.LLM_MODEL = 'modelo-de-prueba';

let lastSystem = '';
let nextModelText = '';
global.fetch = async (url, init) => {
  const body = JSON.parse(init.body);
  lastSystem = body.systemInstruction.parts[0].text;
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: nextModelText }] } }] }) };
};

const controller = require('../src/controllers/chatController');

async function send(content, modelText) {
  nextModelText = modelText;
  const req = { user: { id: 7, role: 'estudiante' }, params: { id: '1' }, body: { content } };
  let out = { status: 200, body: null };
  const res = { status(c) { out.status = c; return this; }, json(b) { out.body = b; return this; } };
  await controller.sendMessage(req, res, (e) => { throw e; });
  return out;
}

(async () => {
  // 1) Pregunta normal: el prompt incluye fragmentos RAG y el filtro quita respuestas
  let r = await send('¿Cómo se calcula la energía potencial?', JSON.stringify({ reply: 'Ep = m·g·h. ¿Qué valores tienes?', action: null }));
  assert.strictEqual(r.status, 201);
  assert(lastSystem.includes('BASE DE CONOCIMIENTO') && /m · g · h/.test(lastSystem), 'RAG no llegó al prompt');
  assert(!/correctAnswer|isCorrect/i.test(lastSystem), 'Se filtró una respuesta correcta al prompt');
  assert(r.body.sources.length > 0);
  console.log('OK 1  RAG en el prompt + filtro de respuestas');

  // 2) Fuera de dominio: sin fragmentos relevantes
  r = await send('¿Cuál es la capital de Francia?', JSON.stringify({ reply: 'Eso está fuera de lo que puedo ayudarte.', action: null }));
  assert(lastSystem.includes('No se encontró información relacionada'));
  console.log('OK 2  Pregunta fuera de dominio sin contexto');

  // 3) CREATE: crea un reporte con el id del usuario autenticado
  r = await send('Sí, créalo', JSON.stringify({ reply: 'Listo.', action: { name: 'create_ticket', args: { subject: 'El simulador no carga', description: 'No carga en el navegador.', user_id: 999 } } }));
  assert.strictEqual(tickets.length, 1);
  assert.strictEqual(tickets[0].user_id, 7, 'el user_id debe ser el autenticado');
  assert(r.body.assistantMessage.content.includes('Reporte #1 creado'));
  console.log('OK 3  CREATE con usuario autenticado (ignora user_id del modelo)');

  // 4) READ
  r = await send('¿Qué reportes tengo?', JSON.stringify({ reply: 'Reviso.', action: { name: 'list_my_tickets', args: {} } }));
  assert(r.body.assistantMessage.content.includes('#1 · El simulador no carga (abierto)'));
  console.log('OK 4  READ de reportes propios');

  // 5) UPDATE: cancelar propio y rechazar ajeno
  r = await send('Cancela el 1', JSON.stringify({ reply: 'Cancelo.', action: { name: 'cancel_ticket', args: { id: 1 } } }));
  assert.strictEqual(tickets[0].status, 'cancelado');
  r = await send('Cancela el 5', JSON.stringify({ reply: 'Cancelo.', action: { name: 'cancel_ticket', args: { id: 5 } } }));
  assert(r.body.assistantMessage.content.includes('No encontré'));
  console.log('OK 5  UPDATE propio / rechazo de ajeno');

  // 6) Acción inventada o peligrosa: se ignora
  r = await send('borra todo', JSON.stringify({ reply: 'Hecho.', action: { name: 'drop_database', args: {} } }));
  assert.strictEqual(r.body.action, null);
  console.log('OK 6  Acción fuera de la lista blanca ignorada');

  // 7) Salida no-JSON: se usa como texto
  r = await send('Hola', 'Hola, ¿en qué te ayudo?');
  assert.strictEqual(r.body.assistantMessage.content, 'Hola, ¿en qué te ayudo?');
  console.log('OK 7  Respuesta no-JSON tolerada');

  // 8) Validaciones de entrada
  r = await send('   ', '{}').catch(() => ({ status: 'x' }));
  assert.strictEqual(r.status, 400);
  r = await send('a'.repeat(1001), '{}');
  assert.strictEqual(r.status, 400);
  console.log('OK 8  Mensaje vacío o demasiado largo -> 400');

  console.log('\nTodas las pruebas de humo pasaron.');
})().catch((e) => {
  console.error('FALLA:', e.message);
  process.exit(1);
});
