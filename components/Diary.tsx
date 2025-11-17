import React, { useState } from 'react';
import { SavedEntry, Flashcard } from '../types';
import Quiz from './Quiz';
import { TrashIcon } from './icons/TrashIcon';
import { saveFlashcard, isFlashcardSaved } from '../services/flashcardService';
import { useToast } from '../contexts/ToastContext';
import { Heading, Text, Stack, Card, Grid, Divider } from '../design-system';

interface DiaryProps {
  entries: SavedEntry[];
  onDeleteEntry: (id: string) => void;
}

const Diary: React.FC<DiaryProps> = ({ entries, onDeleteEntry }) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const toast = useToast();

  const toggleExpand = (id: string) => {
    setExpandedEntryId(prevId => (prevId === id ? null : id));
  };

  const handleAddToFlashcards = (vocab: Flashcard, entry: SavedEntry) => {
    if (isFlashcardSaved(vocab)) {
      toast.info('Diese Lernkarte wurde bereits gespeichert!');
      return;
    }

    const entryData = {
      entryId: entry.id,
      imageUrl: entry.imagePreview,
      location: entry.location
    };

    saveFlashcard(vocab, undefined, entryData);
    toast.success(`"${vocab.es}" wurde zu den Lernkarten hinzugefügt! 🎉`);
  };

  if (entries.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <Stack spacing="sm">
          <Heading level={3}>Dein Tagebuch ist leer.</Heading>
          <Text color="muted">Erstelle deinen ersten Reiseeintrag, um ihn hier zu sehen!</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack spacing="lg">
      <Heading level={2}>Mein Tagebuch</Heading>
      {entries.map(entry => (
        <Card key={entry.id} variant="default" padding="none" className="overflow-hidden transition-all duration-300">
          <div className="p-6 cursor-pointer hover:bg-neutral-50 flex justify-between items-center transition-colors" onClick={() => toggleExpand(entry.id)}>
            <div className="flex items-center gap-4">
              <img src={entry.imagePreview} alt={entry.location} className="h-16 w-16 object-cover rounded-lg flex-shrink-0 shadow-sm" />
              <Stack spacing="xs" className="min-w-0">
                <Heading level={4} className="truncate mb-0">{entry.location}</Heading>
                <Text variant="small" color="muted">{new Date(entry.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </Stack>
            </div>
            <div className="flex items-center gap-1">
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
                        onDeleteEntry(entry.id);
                        toast.success('Eintrag wurde gelöscht');
                      }
                  }}
                  className="p-2 rounded-lg hover:bg-error-50 text-neutral-400 hover:text-error-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-colors"
                  aria-label="Eintrag löschen"
              >
                <TrashIcon />
              </button>
               <svg className={`h-5 w-5 text-neutral-500 transform transition-transform ${expandedEntryId === entry.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {expandedEntryId === entry.id && (
            <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 animate-fade-in">
              <Stack spacing="xl">
                <Stack spacing="sm">
                  <Heading level={5}>Kurzbeschreibung (DE)</Heading>
                  <Text color="secondary">{entry.analysisResult.description_de}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Heading level={5}>Descripción (ES)</Heading>
                  <Text color="secondary" className="italic">{entry.analysisResult.description_es}</Text>
                </Stack>
                
                <Stack spacing="md">
                  <Heading level={5}>Vokabeln (ES → DE)</Heading>
                  <Card variant="outlined" padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-100">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                              <Text variant="meta" color="muted" as="span">Spanisch</Text>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left">
                              <Text variant="meta" color="muted" as="span">Deutsch</Text>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right">
                              <Text variant="meta" color="muted" as="span">Aktionen</Text>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {entry.analysisResult.vocab.map((v, i) => (
                            <tr key={i} className="group hover:bg-primary-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Text variant="body" className="font-medium">{v.es}</Text>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Text variant="body" color="secondary">{v.de}</Text>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleAddToFlashcards(v, entry)}
                                  disabled={isFlashcardSaved(v)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all transform opacity-0 group-hover:opacity-100 ${
                                    isFlashcardSaved(v)
                                      ? 'bg-success-100 text-success-700 cursor-not-allowed'
                                      : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 shadow-sm hover:shadow-md'
                                  }`}
                                  title={isFlashcardSaved(v) ? 'Bereits gespeichert' : 'Zu Lernkarten hinzufügen'}
                                >
                                  {isFlashcardSaved(v) ? '✓ Gespeichert' : '+ Lernkarte'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </Stack>
                
                <Stack spacing="md">
                  <Heading level={5}>Quiz: Teste dein Wissen!</Heading>
                  <Quiz quizData={entry.analysisResult.quiz} />
                </Stack>
                
                <Stack spacing="sm">
                  <Heading level={5}>Tags</Heading>
                  <div className="flex flex-wrap gap-2">
                    {entry.analysisResult.labels.map((label, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                </Stack>
              </Stack>
            </div>
          )}
        </Card>
      ))}
    </Stack>
  );
};

export default Diary;