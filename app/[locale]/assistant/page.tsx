'use client';

import {useState, useRef, useEffect} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {sendChatMessage, type ChatMessage} from '@/lib/chat';

export default function AssistantPage() {
  const t = useTranslations('AIAssistant');
  const locale = useLocale() as 'ar' | 'de' | 'en';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One conversation_id per chat session. Generated once when the page loads.
  const conversationIdRef = useRef<string>('');
  if (!conversationIdRef.current) {
    conversationIdRef.current = crypto.randomUUID();
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading]);

  async function handleSend(messageText?: string) {
    const text = (messageText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Build history from prior messages (capped at last 10 turns for context)
    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      const responseText = await sendChatMessage(
        text,
        locale,
        conversationIdRef.current,
        history
      );
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Chat error:', e);
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const exampleKeys = ['ownership', 'fraud', 'banking'] as const;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-200px)]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">{t('emptyState')}</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">{t('exampleHeading')}</p>
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {exampleKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleSend(t(`examples.${key}`))}
                  className="text-sm text-start px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  {t(`examples.${key}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <p className="text-sm text-gray-500 italic">{t('thinking')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            rows={2}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {t('send')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
