
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatReply } from '../services/geminiService';
import { ChatMessage, Flashcard } from '../types';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: '¡Hola! ¿En qué puedo ayudarte hoy con tu español?' }], response: { reply: '¡Hola! ¿En qué puedo ayudarte hoy con tu español?' } }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = [...messages, userMessage];
      const response = await getChatReply(history);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.reply }], response: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setError('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const FlashcardDisplay: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => (
    <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
      <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2"><SparklesIcon /> Vorschläge für Lernkarten</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {flashcards.map((card, i) => (
          <div key={i} className="bg-white p-2 rounded-md shadow-sm">
            <p className="font-medium text-slate-700">{card.es}</p>
            <p className="text-slate-500">{card.de}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[70vh]">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Spanisch-Lern-Chat</h2>
        <p className="text-sm text-slate-500">Übe dein Spanisch mit deinem persönlichen AI-Tutor</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              <p className="whitespace-pre-wrap">{msg.response?.reply || msg.parts[0].text}</p>
              {msg.role === 'model' && msg.response?.suggested_flashcards && (
                <FlashcardDisplay flashcards={msg.response.suggested_flashcards} />
              )}
            </div>
          </div>
        ))}
         {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-slate-200 text-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {error && <p className="p-4 text-sm text-red-600">{error}</p>}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreibe eine Nachricht auf Spanisch..."
            className="flex-1 block w-full border-slate-300 rounded-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
