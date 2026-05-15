export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

/**
 * Placeholder response generator.
 * Replace this with a real API call to /chat endpoint (FastAPI → Ollama) later.
 * The function signature should stay the same so swapping is a one-line change.
 */
export async function sendChatMessage(
  userMessage: string,
  locale: 'ar' | 'de' | 'en'
): Promise<string> {
  // Simulate network latency so the UI feels real
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Hardcoded fake response by language — replace with real AI later
  const fakeResponses: Record<'ar' | 'de' | 'en', string> = {
    en: `Thank you for your question: "${userMessage}". This is a placeholder response. The real AI assistant is not yet connected. Once integrated with the backend, this assistant will answer based on a curated knowledge base of Syrian real estate law and procedures, with cited sources for every claim.`,
    de: `Vielen Dank für Ihre Frage: "${userMessage}". Dies ist eine Platzhalter-Antwort. Der echte KI-Assistent ist noch nicht angeschlossen. Sobald er mit dem Backend verbunden ist, wird dieser Assistent auf Basis einer kuratierten Wissensdatenbank zum syrischen Immobilienrecht antworten, mit Quellenangaben für jede Aussage.`,
    ar: `شكرًا على سؤالك: "${userMessage}". هذه استجابة مؤقتة. لم يتم ربط المساعد الذكي الحقيقي بعد. بمجرد دمجه مع الخادم الخلفي، سيجيب هذا المساعد بناءً على قاعدة معرفة منسقة لقانون العقارات السوري والإجراءات، مع ذكر المصادر لكل ادعاء.`
  };

  return fakeResponses[locale];
}
