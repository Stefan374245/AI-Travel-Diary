
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatReply } from '../services/geminiService';
import { saveFlashcard, isFlashcardSaved } from '../services/flashcardService';
import { ChatMessage, Flashcard, SavedEntry, LanguageLevel, LanguageLevelInfo } from '../types';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Heading, Text, Stack, Card, Grid } from '../design-system';

interface ChatProps {
  savedEntries: SavedEntry[];
}

const LANGUAGE_LEVELS: LanguageLevelInfo[] = [
  { level: 'A1', label: 'A1 - Anfänger', description: 'Grundlegende Wörter und Sätze' },
  { level: 'A2', label: 'A2 - Grundkenntnisse', description: 'Alltägliche Ausdrücke und einfache Sätze' },
  { level: 'B1', label: 'B1 - Mittelstufe', description: 'Vertraute Themen und persönliche Erfahrungen' },
  { level: 'B2', label: 'B2 - Fortgeschritten', description: 'Komplexe Texte und abstrakte Themen' },
  { level: 'C1', label: 'C1 - Sehr fortgeschritten', description: 'Anspruchsvolle Texte und implizite Bedeutungen' },
  { level: 'C2', label: 'C2 - Muttersprachlich', description: 'Nahezu muttersprachliche Beherrschung' }
];

const STORAGE_KEY_LEVEL = 'spanish-learning-level';

const Chat: React.FC<ChatProps> = ({ savedEntries }) => {
  const [languageLevel, setLanguageLevel] = useState<LanguageLevel>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEVEL);
    return (saved as LanguageLevel) || 'A2';
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: '¡Hola! ¿En qué puedo ayudarte hoy con tu español?' }], response: { reply: '¡Hola! ¿En qué puedo ayudarte hoy con tu español?' } }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<SavedEntry | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEVEL, languageLevel);
  }, [languageLevel]);

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
      const response = await getChatReply(history, languageLevel);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.reply }], response: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setError('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleSaveFlashcard = (flashcard: Flashcard) => {
    // Verwende Kontext vom importierten Reiseeintrag wenn vorhanden
    const entryData = selectedEntry ? {
      entryId: selectedEntry.id,
      imageUrl: selectedEntry.imagePreview,
      location: selectedEntry.location
    } : undefined;
    
    const savedCard = saveFlashcard(flashcard, undefined, entryData);
    setSavedCards(prev => new Set([...prev, savedCard.es]));
  };

  const FlashcardDisplay: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => (
    <Card variant="ghost" padding="sm" className="mt-3 border border-primary-200">
      <Stack spacing="sm">
        <div className="flex items-center gap-2">
          <SparklesIcon />
          <Text variant="label" color="primary" className="text-primary-800">Vorschläge für Lernkarten</Text>
        </div>
        <Grid cols={2} gap="xs">
          {flashcards.map((card, i) => {
            const isSaved = savedCards.has(card.es) || isFlashcardSaved(card);
            return (
              <Card key={i} variant="default" padding="sm">
                <Stack spacing="xs">
                  <Text variant="body" className="font-medium">{card.es}</Text>
                  <Text variant="small" color="muted">{card.de}</Text>
                  <button
                    onClick={() => handleSaveFlashcard(card)}
                    disabled={isSaved}
                    className={`w-full px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isSaved 
                        ? 'bg-success-100 text-success-700 cursor-not-allowed' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isSaved ? '✓ Gespeichert' : '+ Speichern'}
                  </button>
                </Stack>
              </Card>
            );
          })}
        </Grid>
      </Stack>
    </Card>
  );

  const handleImportEntry = (entryId: string) => {
    const entry = savedEntries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      const contextMessage = `Ich möchte über dieses Reisefoto sprechen: ${entry.location}. ${entry.analysisResult.description_de}`;
      const userMessage: ChatMessage = { 
        role: 'user', 
        parts: [{ text: contextMessage }] 
      };
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      getChatReply([...messages, userMessage], languageLevel)
        .then(response => {
          const modelMessage: ChatMessage = { 
            role: 'model', 
            parts: [{ text: response.reply }], 
            response: response 
          };
          setMessages(prev => [...prev, modelMessage]);
        })
        .catch(err => {
          console.error(err);
          setError('Fehler beim Laden des Kontexts.');
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <Card variant="default" padding="none" className="flex flex-col h-[70vh] overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <Stack spacing="sm">
          <Heading level={3} className="mb-0">Spanisch-Lern-Chat</Heading>
          <Text variant="small" color="muted">Übe dein Spanisch mit deinem persönlichen AI-Tutor</Text>
          
          <Stack spacing="xs" className="mt-2">
            <Text variant="label" color="secondary" as="label" htmlFor="level-select">
              📊 Sprachniveau:
            </Text>
            <div className="relative group">
              <select
                id="level-select"
                value={languageLevel}
                onChange={(e) => setLanguageLevel(e.target.value as LanguageLevel)}
                className="w-full text-sm border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-white rounded-xl shadow-sm px-4 py-2.5 pr-10 appearance-none cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-lg font-medium text-primary-900"
                aria-label="Sprachniveau auswählen"
              >
                {LANGUAGE_LEVELS.map(lvl => (
                  <option key={lvl.level} value={lvl.level}>
                    {lvl.label} - {lvl.description}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary-500 group-hover:text-primary-600 transition-colors duration-200">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Stack>
          
          {savedEntries.length > 0 && (
            <Stack spacing="xs" className="mt-2">
              <Text variant="label" color="secondary" as="label" htmlFor="entry-select">
                📸 Reiseeintrag importieren:
              </Text>
              <div className="relative group">
                <select
                  id="entry-select"
                  onChange={(e) => handleImportEntry(e.target.value)}
                  className="w-full text-sm border-2 border-neutral-200 bg-white rounded-xl shadow-sm px-4 py-2.5 pr-10 appearance-none cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-lg"
                  defaultValue=""
                  aria-label="Reiseeintrag auswählen"
                >
                  <option value="" disabled>Wähle einen Reiseeintrag...</option>
                  {savedEntries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.location} - {new Date(entry.timestamp).toLocaleDateString('de-DE')}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Stack>
          )}
        </Stack>
      </div>
      {selectedEntry && (
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-200 flex items-center gap-3">
          <img 
            src={selectedEntry.imagePreview} 
            alt={selectedEntry.location} 
            className="w-12 h-12 object-cover rounded-lg shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <Text variant="small" className="font-semibold text-primary-900 truncate">{selectedEntry.location}</Text>
            <Text variant="meta" className="text-primary-700 normal-case">Aktiver Kontext im Chat</Text>
          </div>
          <button
            onClick={() => setSelectedEntry(null)}
            className="text-primary-600 hover:text-primary-800 transition-colors"
          >
            <Text variant="meta" className="normal-case">✕ Entfernen</Text>
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">
        <Stack spacing="md">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-900'
              }`}>
                <Text variant="body" className={msg.role === 'user' ? 'text-white' : 'text-neutral-900'} as="span">
                  {msg.response?.reply || msg.parts[0].text}
                </Text>
                {msg.role === 'model' && msg.response?.grammar_tip && (
                  <div className="mt-3 p-3 bg-info-50 border border-info-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Text variant="label" className="text-info-800">💡 Grammatik-Tipp:</Text>
                    </div>
                    <Text variant="small" className="text-info-900 mt-1">{msg.response.grammar_tip}</Text>
                  </div>
                )}
                {msg.role === 'model' && msg.response?.difficulty_feedback && (
                  <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded-lg">
                    <Text variant="small" className="text-warning-900">
                      <span className="font-semibold">📈 Feedback:</span> {msg.response.difficulty_feedback}
                    </Text>
                  </div>
                )}
                {msg.role === 'model' && msg.response?.suggested_flashcards && (
                  <FlashcardDisplay flashcards={msg.response.suggested_flashcards} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-neutral-100 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </Stack>
      </div>
      {error && (
        <div className="px-6 py-4">
          <Text variant="small" color="error">{error}</Text>
        </div>
      )}
      <div className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreibe eine Nachricht auf Spanisch..."
            className="flex-1 block w-full border-neutral-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base px-4 py-2.5 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-full h-11 w-11 bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            aria-label="Nachricht senden"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;
