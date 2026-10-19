export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: number | string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Fragmentos de la base de conocimiento usados para responder (solo respuestas nuevas). */
  sources?: string[];
}

export interface ChatConversation {
  id: number;
  moduleId: number | null;
  sectionId: number | null;
}

export interface ChatStatus {
  enabled: boolean;
  dailyLimit: number;
  used: number;
  provider?: string;
}

export interface OpenConversationResponse {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  remaining: number;
  sources: string[];
  action: { name: string; ok: boolean } | null;
}

export interface ChatContext {
  moduleId: number | null;
  sectionId: number | null;
}
