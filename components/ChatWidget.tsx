'use client';

import {useState, useRef, useEffect} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import {sendChatMessage, type ChatMessage} from '@/lib/chat';

// Floating AI assistant, mounted in the root layout so it's available on every
// page. Click the bubble to open a compact chat panel. Reuses the same
// sendChatMessage client and AIAssistant translations as the full /assistant
// page — and hides itself there so there aren't two chat UIs on one screen.
export default function ChatWidget() {
  const t = useTranslations('AIAssistant');
  const locale = useLocale() as 'ar' | 'de' | 'en';
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One conversation id per widget session (lazy init — runs once).
  const [conversationId] = useState(() => crypto.randomUUID());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading, isOpen]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

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

    const history = messages.slice(-10).map((m) => ({role: m.role, content: m.content}));

    try {
      const responseText = await sendChatMessage(text, locale, conversationId, history);
      setMessages((prev) => [
        ...prev,
        {id: crypto.randomUUID(), role: 'assistant', content: responseText, timestamp: Date.now()}
      ]);
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

  // The full-page assistant already is the chat — don't stack the widget on it.
  if (pathname === '/assistant') return null;

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 end-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[560px] flex flex-col bg-surface-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-navy text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">💬</span>
              <span className="font-semibold text-sm">{t('widgetTitle')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('closeChat')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6 px-2">{t('emptyState')}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                      msg.role === 'user' ? 'bg-brand-navy text-white' : 'bg-surface-page text-text-primary'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-page px-3 py-2 rounded-2xl">
                  <p className="text-sm text-text-tertiary italic">{t('thinking')}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <p className="text-sm text-accent-danger text-center">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border-subtle p-3 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                rows={1}
                className="flex-1 px-3 py-2 bg-surface-page border border-border-subtle rounded-lg text-text-primary text-sm resize-none focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy max-h-24"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {t('send')}
              </button>
            </div>
            <p className="text-[11px] text-text-tertiary mt-2 text-center leading-snug">{t('disclaimer')}</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? t('closeChat') : t('openChat')}
        aria-expanded={isOpen}
        className="fixed bottom-4 end-4 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-brand-navy text-white shadow-lg hover:bg-brand-navy-hover hover:scale-105 active:scale-95 transition-all"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
