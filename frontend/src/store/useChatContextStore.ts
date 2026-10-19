import { create } from 'zustand';
import type { ChatContext } from '../types/chat';

interface ChatContextState extends ChatContext {
  setChatContext: (ctx: Partial<ChatContext>) => void;
  clearChatContext: () => void;
}

/**
 * Las páginas de módulo llaman setChatContext({ moduleId, sectionId }) en un useEffect
 * para que el tutor explique el contenido que el estudiante está viendo.
 */
export const useChatContextStore = create<ChatContextState>((set) => ({
  moduleId: null,
  sectionId: null,
  setChatContext: (ctx) => set((s) => ({ ...s, ...ctx })),
  clearChatContext: () => set({ moduleId: null, sectionId: null }),
}));
