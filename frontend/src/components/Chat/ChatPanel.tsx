import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { chatService, getChatErrorMessage } from '../../services/chatService';
import { useChatContextStore } from '../../store/useChatContextStore';
import type { ChatMessage as ChatMessageType, ChatStatus } from '../../types/chat';
import ChatMessage from './ChatMessage';

const MAX_CHARS = 1000;

interface Props {
  onClose: () => void;
}

export default function ChatPanel({ onClose }: Props) {
  const moduleId = useChatContextStore((s) => s.moduleId);
  const sectionId = useChatContextStore((s) => s.sectionId);

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Cargar estado y conversación (se reinicia si cambia el módulo o sección)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const st = await chatService.getStatus();
        if (cancelled) return;
        setStatus(st);
        if (!st.enabled) return;

        const res = await chatService.openConversation({ moduleId, sectionId });
        if (cancelled) return;
        setConversationId(res.conversation.id);
        setMessages(res.messages);
      } catch (err) {
        if (!cancelled) setError(getChatErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId, sectionId]);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  // Foco al abrir
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const limitReached = status ? status.used >= status.dailyLimit : false;
  const disabled = !status?.enabled || limitReached || conversationId === null;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || conversationId === null) return;
    if (text.length > MAX_CHARS) {
      setError(`El mensaje no puede superar ${MAX_CHARS} caracteres.`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await chatService.sendMessage(conversationId, text);
      setMessages((prev) => [
        ...prev,
        res.userMessage,
        { ...res.assistantMessage, sources: res.sources },
      ]);
      setInput('');
      setStatus((s) => (s ? { ...s, used: s.dailyLimit - res.remaining } : s));
    } catch (err) {
      setError(getChatErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [input, sending, conversationId]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <section className="fmb-chat-panel" role="dialog" aria-label="Asistente FisioMathBot">
      <header className="fmb-chat-header">
        <div>
          <strong>FisioMathBot Chat</strong>
          <span className="fmb-chat-sub">Tu tutor de Física, Mate y Tecnología</span>
        </div>
        <button type="button" className="fmb-chat-close" onClick={onClose} aria-label="Cerrar chat">
          ×
        </button>
      </header>

      <div className="fmb-chat-list" ref={listRef} aria-live="polite">
        {loading && <p className="fmb-chat-note">Cargando…</p>}

        {!loading && status && !status.enabled && (
          <p className="fmb-chat-note">
            El asistente no está disponible por ahora. Puedes seguir usando los módulos con normalidad.
          </p>
        )}

        {!loading && status?.enabled && messages.length === 0 && (
          <p className="fmb-chat-note">
            ¡Hola! Soy tu tutor. Pregúntame sobre energía potencial, energía cinética o lo que estés
            viendo. Te daré pistas, no respuestas de los quizzes.
          </p>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {sending && (
          <div className="fmb-chat-row fmb-chat-row--bot">
            <div className="fmb-chat-bubble fmb-chat-bubble--bot fmb-chat-typing" aria-label="Escribiendo">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fmb-chat-error" role="alert">
          {error}
        </div>
      )}
      {limitReached && (
        <div className="fmb-chat-error" role="alert">
          Alcanzaste el límite de mensajes de hoy. Vuelve mañana.
        </div>
      )}

      <form className="fmb-chat-form" onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe tu duda…"
          rows={2}
          maxLength={MAX_CHARS}
          disabled={disabled || sending}
          aria-label="Mensaje para el asistente"
        />
        <button type="submit" disabled={disabled || sending || !input.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
