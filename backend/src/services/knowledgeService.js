'use strict';
/**
 * Base de conocimiento (RAG léxico) del asistente.
 * - Lee los archivos Markdown de backend/knowledge/
 * - Los divide en fragmentos por encabezado y párrafo
 * - Recupera los más relevantes con BM25 (sin dependencias ni costo de embeddings)
 * La interfaz search(query, k) permite cambiar a embeddings sin tocar el controlador.
 */
const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || path.join(__dirname, '..', '..', 'knowledge');
const MAX_WORDS = 140;
const K1 = 1.4;
const B = 0.75;

const STOP = new Set(
  ('a al algo como con cual cuales cuando de del el ella en es esta este esto estos fue ha han hay la las le les lo los me mi mis muy ' +
    'no nos o para pero por que se si sin sobre su sus te tiene tu un una uno unos y ya yo mas son ser puede pueden cada entre ' +
    'the a an of to is are and or in on for with how what do does').split(/\s+/)
);

/*
 * Diccionario inglés -> español para preguntas en inglés: la base de conocimiento está en español
 * y BM25 compara palabras exactas. Se agregan los equivalentes en español a la consulta.
 * Claves en minúscula y en singular (también se prueba la palabra sin la "s" final).
 */
const EN_ES = {
  // Plataforma
  platform: 'plataforma', register: 'registro registrarse', signup: 'registro', sign: 'iniciar sesion',
  account: 'cuenta registro', login: 'iniciar sesion acceder', log: 'iniciar cerrar sesion', logout: 'cerrar sesion',
  password: 'contraseña', email: 'correo electronico', forgot: 'olvidas', session: 'sesion',
  menu: 'menu lateral', sidebar: 'menu lateral', navigation: 'menu navegacion', search: 'buscador',
  notification: 'notificaciones', home: 'inicio', dashboard: 'inicio panel', progres: 'progreso avance',
  advance: 'avance', profile: 'perfil', edit: 'editar', save: 'guardar', setting: 'configuracion',
  role: 'roles', student: 'estudiante', teacher: 'docente profesor', admin: 'administrador admin',
  administrator: 'administrador', user: 'usuario', institution: 'institucion', school: 'colegio institucion',
  module: 'modulo', lesson: 'lecciones', science: 'ciencia', math: 'matematicas', mathematic: 'matematicas',
  technology: 'tecnologia', quiz: 'quiz evaluaciones', test: 'evaluaciones', exam: 'evaluaciones',
  evaluation: 'evaluaciones', answer: 'respuestas', report: 'reportar reporte', bug: 'error falla',
  error: 'error falla', problem: 'problema falla', support: 'soporte', complaint: 'queja', cancel: 'cancelar',
  chat: 'asistente chat', assistant: 'asistente', bot: 'asistente', message: 'mensajes', limit: 'limite',
  privacy: 'privacidad', data: 'datos', browser: 'navegador',
  // Proyecto
  project: 'proyecto', developer: 'desarrollan', team: 'equipo', methodology: 'metodologia',
  // Física y simulador
  energy: 'energia', potential: 'potencial', kinetic: 'cinetica', mechanical: 'mecanica',
  conservation: 'conservacion', mass: 'masa', height: 'altura', speed: 'velocidad', velocity: 'velocidad',
  gravity: 'gravedad', moon: 'luna', mar: 'marte', earth: 'tierra', space: 'espacio', friction: 'friccion',
  slope: 'pendiente inclinacion', ramp: 'rampa', incline: 'inclinacion plano inclinado', formula: 'formula',
  calculate: 'calcula', relative: 'relativo', simulator: 'simulador', simulation: 'simulador',
  camera: 'camara vista', graph: 'grafica', chart: 'grafica', robot: 'robot', sensor: 'sensores',
  block: 'bloques', programming: 'programacion', computational: 'computacional', workshop: 'talleres',
};

function expandQuery(query) {
  const extra = [];
  for (const w of normalize(query).split(/[^a-z0-9ñ]+/)) {
    const es = EN_ES[w] || EN_ES[w.replace(/s$/, '')];
    if (es) extra.push(es);
  }
  return extra.length ? `${query} ${extra.join(' ')}` : query;
}

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function stem(w) {
  // Reducción ligera de plurales y terminaciones comunes en español
  if (w.length > 5 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}

function tokenize(s) {
  return normalize(s)
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

function chunkMarkdown(file, raw) {
  const chunks = [];
  let docTitle = file;
  let section = '';
  let buffer = [];

  const flush = () => {
    const body = buffer.join(' ').replace(/\s+/g, ' ').trim();
    buffer = [];
    if (!body) return;
    const words = body.split(' ');
    for (let i = 0; i < words.length; i += MAX_WORDS) {
      const piece = words.slice(i, i + MAX_WORDS).join(' ');
      chunks.push({
        source: file,
        title: section || docTitle,
        text: piece,
      });
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('> ')) continue; // notas internas para el equipo
    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##+\s+(.*)/);
    if (h1) {
      flush();
      docTitle = h1[1].trim();
      section = docTitle;
    } else if (h2) {
      flush();
      section = `${docTitle} — ${h2[1].trim()}`;
    } else if (line.trim()) {
      buffer.push(line.trim());
    }
  }
  flush();
  return chunks;
}

let index = null;

function build() {
  const chunks = [];
  if (fs.existsSync(KNOWLEDGE_DIR)) {
    for (const f of fs.readdirSync(KNOWLEDGE_DIR).filter((x) => x.endsWith('.md')).sort()) {
      chunks.push(...chunkMarkdown(f, fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf8')));
    }
  }
  const docs = chunks.map((c) => {
    const tokens = tokenize(`${c.title} ${c.title} ${c.text}`); // el título pesa doble
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    return { ...c, tf, len: tokens.length };
  });
  const df = new Map();
  docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / (docs.length || 1);
  index = { docs, df, avgLen, n: docs.length };
  return index;
}

function getIndex() {
  return index || build();
}

/**
 * @param {string} query
 * @param {number} k
 * @returns {{source:string,title:string,text:string,score:number}[]}
 */
function search(query, k = 4) {
  const { docs, df, avgLen, n } = getIndex();
  const qTokens = [...new Set(tokenize(expandQuery(query)))];
  if (!qTokens.length || !n) return [];

  const scored = docs.map((d) => {
    let score = 0;
    for (const t of qTokens) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (n - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen));
    }
    return { source: d.source, title: d.title, text: d.text, score };
  });

  return scored
    .filter((r) => r.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function stats() {
  const { n, docs } = getIndex();
  return { chunks: n, files: [...new Set(docs.map((d) => d.source))].length };
}

module.exports = { search, stats, rebuild: build };
