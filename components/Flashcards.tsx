import React, { useState, useEffect } from 'react';
import { SavedFlashcard } from '../types';
import { loadFlashcards, deleteFlashcard } from '../services/flashcardService';
import { TrashIcon } from './icons/TrashIcon';

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cards = loadFlashcards();
    setFlashcards(cards);
  }, []);

  const handleFlip = (id: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Möchtest du diese Lernkarte wirklich löschen?')) {
      deleteFlashcard(id);
      setFlashcards(prev => prev.filter(card => card.id !== id));
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-slate-700">Keine Lernkarten gespeichert</h2>
        <p className="mt-2 text-slate-500">
          Gehe zum Spanisch-Lern-Chat und speichere Lernkarten, um sie hier zu sehen!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meine Lernkarten</h2>
          <p className="text-slate-500 mt-1">{flashcards.length} {flashcards.length === 1 ? 'Karte' : 'Karten'} gespeichert</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map(card => {
          const isFlipped = flippedCards.has(card.id);
          return (
            <div key={card.id} className="relative group">
              <div className="perspective-1000">
                <div
                  className={`relative w-full h-48 transition-transform duration-500 transform-style-3d cursor-pointer ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => handleFlip(card.id)}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Vorderseite (Spanisch) */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center text-white backface-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    <p className="text-sm font-medium opacity-75 mb-2">Spanisch</p>
                    <p className="text-2xl font-bold text-center">{card.es}</p>
                    <p className="text-xs opacity-75 mt-4">Klicken zum Umdrehen</p>
                  </div>

                  {/* Rückseite (Deutsch) */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center text-white backface-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-sm font-medium opacity-75 mb-2">Deutsch</p>
                    <p className="text-2xl font-bold text-center">{card.de}</p>
                    <p className="text-xs opacity-75 mt-4">Klicken zum Umdrehen</p>
                  </div>
                </div>
              </div>

              {/* Löschen-Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(card.id);
                }}
                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 z-10"
                aria-label="Lernkarte löschen"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-indigo-800 mb-2">💡 Tipp zum Lernen:</h3>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Klicke auf eine Karte, um sie umzudrehen</li>
          <li>• Übe regelmäßig, um die Vokabeln zu festigen</li>
          <li>• Versuche die deutsche Übersetzung zu erraten, bevor du umdrehst</li>
        </ul>
      </div>
    </div>
  );
};

export default Flashcards;
