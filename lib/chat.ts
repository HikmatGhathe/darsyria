import {apiRequest} from './api';
import type {ChatResponse} from './types';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export async function sendChatMessage(
  userMessage: string,
  locale: 'ar' | 'de' | 'en',
  conversationId: string,
  history: ChatHistoryItem[]
): Promise<string> {
  const response = await apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: {
      conversation_id: conversationId,
      message: userMessage,
      locale,
      history
    },
    authenticated: true
  });

  return response.content;
}
