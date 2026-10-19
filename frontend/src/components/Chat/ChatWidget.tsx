import { lazy, Suspense, useState } from 'react';
import './Chat.css';

// El panel se carga solo cuando el estudiante abre el chat
const ChatPanel = lazy(() => import('./ChatPanel'));

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
      <button
        type="button"
        className="fmb-chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente FisioMathBot'}
        aria-expanded={open}
      >
        {open ? '×' : '💬'}
      </button>
    </>
  );
}
