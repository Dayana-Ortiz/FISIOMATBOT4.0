'use strict';
/**
 * Abstracción del proveedor de LLM (Anthropic o Gemini).
 * Interfaz pública: isEnabled(), providerName(), generateReply(messages, { system, json })
 * Se elige con LLM_PROVIDER = anthropic | gemini  (por defecto: anthropic).
 * Para añadir otro proveedor (OpenAI, Ollama...) solo se agrega una función aquí.
 */

class LlmError extends Error {
  constructor(message, code = 'LLM_ERROR') {
    super(message);
    this.name = 'LlmError';
    this.code = code;
  }
}

const provider = () => (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
const maxTokens = () => parseInt(process.env.CHAT_MAX_OUTPUT_TOKENS || '600', 10);

function providerName() {
  return provider();
}

function isEnabled() {
  if (!process.env.LLM_MODEL) return false;
  return provider() === 'gemini' ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Los roles deben alternar y el primer mensaje debe ser 'user'. */
function normalizeMessages(messages) {
  const out = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else out.push({ role: m.role, content: m.content });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

// ---------- Anthropic ----------
let anthropicClient = null;
async function callAnthropic(messages, system) {
  if (!anthropicClient) {
    // eslint-disable-next-line global-require
    const mod = require('@anthropic-ai/sdk');
    const Anthropic = mod.default || mod;
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30000, maxRetries: 1 });
  }
  const res = await anthropicClient.messages.create({
    model: process.env.LLM_MODEL,
    max_tokens: maxTokens(),
    system,
    messages,
  });
  return (res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

// ---------- Gemini (REST, sin SDK) ----------
async function callGemini(messages, system, json) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.LLM_MODEL)}:generateContent`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: {
          maxOutputTokens: maxTokens(),
          temperature: 0.3,
          ...(json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });
    if (!res.ok) {
      const err = new Error('gemini http');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    return parts.map((p) => p.text || '').join('\n');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{role:'user'|'assistant', content:string}[]} messages
 * @param {{system:string, json?:boolean}} opts
 * @returns {Promise<string>} texto crudo del modelo
 */
async function generateReply(messages, { system, json = false }) {
  if (!isEnabled()) throw new LlmError('El asistente no está configurado.', 'LLM_DISABLED');
  const msgs = normalizeMessages(messages);
  try {
    const text = provider() === 'gemini' ? await callGemini(msgs, system, json) : await callAnthropic(msgs, system);
    if (!text || !text.trim()) throw new LlmError('Respuesta vacía del asistente.', 'LLM_EMPTY');
    return text.trim();
  } catch (err) {
    if (err instanceof LlmError) throw err;
    // No se registra el contenido de los mensajes, solo el tipo de fallo.
    console.error('[chat] fallo del proveedor LLM:', provider(), err && err.status ? `HTTP ${err.status}` : err.name);
    throw new LlmError('El asistente no está disponible en este momento.', 'LLM_UNAVAILABLE');
  }
}

module.exports = { isEnabled, providerName, generateReply, LlmError };
