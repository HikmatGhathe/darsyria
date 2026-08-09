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

  // One conversation id per session (lazy init — runs once).
  const [conversationId] = useState(() => crypto.randomUUID());

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
    const history = messages.slice(-10).map((m) => ({role: m.role, content: m.content}));

    try {
      const responseText = await sendChatMessage(text, locale, conversationId, history);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[560px] bg-surface-card border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border-subtle">
          <div className="w-11 h-11 rounded-full bg-brand-navy text-white flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary leading-tight">{t('title')}</h1>
            <p className="text-xs sm:text-sm text-text-secondary line-clamp-1">{t('subtitle')}</p>
          </div>
        </header>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 bg-surface-page">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-2">
              <div className="w-14 h-14 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center mb-4">
                <span className="text-2xl" aria-hidden="true">💬</span>
              </div>
              <p className="text-text-secondary mb-6 max-w-sm">{t('emptyState')}</p>
              <p className="text-sm font-semibold text-text-primary mb-3">{t('exampleHeading')}</p>
              <div className="flex flex-col gap-2 w-full max-w-md">
                {exampleKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSend(t(`examples.${key}`))}
                    className="text-sm text-start px-4 py-2.5 bg-surface-card border border-border-subtle rounded-xl hover:border-brand-navy transition-colors"
                  >
                    {t(`examples.${key}`)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-brand-navy text-white rounded-br-md'
                      : 'bg-surface-card text-text-primary border border-border-subtle rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-card border border-border-subtle px-4 py-2.5 rounded-2xl rounded-bl-md">
                <p className="text-sm text-text-tertiary italic">{t('thinking')}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <p className="text-sm text-accent-danger">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-3 sm:p-4 bg-surface-card">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              rows={2}
              className="flex-1 px-4 py-3 bg-surface-page border border-border-subtle rounded-xl text-text-primary resize-none focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy max-h-40"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="px-5 sm:px-6 py-3 bg-brand-navy text-white rounded-xl hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shrink-0"
            >
              {t('send')}
            </button>
          </div>
          <p className="text-xs text-text-tertiary mt-2.5 text-center">{t('disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
