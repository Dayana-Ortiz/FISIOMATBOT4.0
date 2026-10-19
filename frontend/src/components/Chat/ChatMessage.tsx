import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const mine = message.role === 'user';
  return (
    <div className={`fmb-chat-row ${mine ? 'fmb-chat-row--user' : 'fmb-chat-row--bot'}`}>
      <div
        className={`fmb-chat-bubble ${mine ? 'fmb-chat-bubble--user' : 'fmb-chat-bubble--bot'}`}
      >
        {message.content}
        {!mine && message.sources && message.sources.length > 0 && (
          <div className="fmb-chat-sources">Fuentes: {message.sources.join(' · ')}</div>
        )}
      </div>
    </div>
  );
}
