import { apiRequest } from './api';
import type {
  ChatContext,
  ChatStatus,
  OpenConversationResponse,
  SendMessageResponse,
} from '../types/chat';

// apiRequest ya antepone la URL de la API (/api) y serializa el body a JSON.
export const chatService = {
  getStatus: () => apiRequest<ChatStatus>('/chat/status'),

  openConversation: (ctx: ChatContext) =>
    apiRequest<OpenConversationResponse>('/chat/conversations', {
      method: 'POST',
      body: ctx,
    }),

  sendMessage: (conversationId: number, content: string) =>
    apiRequest<SendMessageResponse>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    }),
};

export function getChatErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return 'No se pudo contactar al asistente. Intenta de nuevo.';
}
