import React, { useState, useEffect } from 'react';
import { SavedFlashcard } from '../types';
import { loadFlashcards, deleteFlashcard, reviewFlashcard, getDueFlashcards, getFlashcardStats } from '../services/flashcardService';
import { TrashIcon } from './icons/TrashIcon';
import FlashcardQuiz from './FlashcardQuiz';
import { useToast } from '../contexts/ToastContext';

type ViewMode = 'browse' | 'study' | 'quiz';

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState(getFlashcardStats());
  const [studyCards, setStudyCards] = useState<SavedFlashcard[]>([]);
  const [slideAnimation, setSlideAnimation] = useState<'slide-out-left' | 'slide-out-right' | 'slide-in' | null>(null);
  const [flippedBrowseCards, setFlippedBrowseCards] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    refreshCards();
  }, []);

  const refreshCards = () => {
    const cards = loadFlashcards();
    setFlashcards(cards);
    setStats(getFlashcardStats());
    const due = getDueFlashcards();
    setStudyCards(due);
  };

  const handleAnswer = async (correct: boolean) => {
    if (studyCards.length === 0) return;
    
    const currentCard = studyCards[currentCardIndex];
    
    // Slide out animation
    setSlideAnimation(correct ? 'slide-out-right' : 'slide-out-left');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    reviewFlashcard(currentCard.id, correct);
    
    // Move to next card or finish
    if (currentCardIndex < studyCards.length - 1) {
      setSlideAnimation('slide-in');
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      
      setTimeout(() => setSlideAnimation(null), 500);
    } else {
      // All cards done
      setViewMode('browse');
      setCurrentCardIndex(0);
      setSlideAnimation(null);
    }
    
    refreshCards();
  };

  const startStudyMode = () => {
    const due = getDueFlashcards();
    if (due.length > 0) {
      setStudyCards(due);
      setCurrentCardIndex(0);
      setViewMode('study');
      setIsFlipped(false);
      setSlideAnimation('slide-in');
      setTimeout(() => setSlideAnimation(null), 500);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Möchtest du diese Lernkarte wirklich löschen?')) {
      deleteFlashcard(id);
      refreshCards();
      toast.success('Lernkarte wurde gelöscht');
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

  // Quiz Mode View
  if (viewMode === 'quiz') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setViewMode('browse');
            refreshCards(); // Refresh nach Quiz-Beendigung
          }}
          className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
        >
          ← Zurück zur Übersicht
        </button>
        <FlashcardQuiz onQuizComplete={refreshCards} />
      </div>
    );
  }

  // Study Mode View
  if (viewMode === 'study') {
    if (studyCards.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-12 rounded-2xl shadow-lg border border-green-200">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Perfekt!</h2>
            <p className="text-green-700 mb-6">Keine Karten sind heute fällig. Komm morgen wieder!</p>
            <button
              onClick={() => setViewMode('browse')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      );
    }

    const currentCard = studyCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">Fortschritt</span>
            <span className="text-sm text-slate-500">{currentCardIndex + 1} / {studyCards.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Study Card */}
        <div className="flex justify-center items-center min-h-[500px]">
          <div 
            className={`w-full max-w-md ${
              slideAnimation === 'slide-out-left' ? 'animate-slide-out-left' :
              slideAnimation === 'slide-out-right' ? 'animate-slide-out-right' :
              slideAnimation === 'slide-in' ? 'animate-slide-in' : ''
            }`}
          >
            <div 
              className="perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className={`relative w-full h-96 transition-transform duration-700 ease-out preserve-3d ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">Spanisch</div>
                    <div className="text-5xl font-bold text-center mb-8">{currentCard.es}</div>
                    <div className="text-sm opacity-75 animate-pulse">👆 Klicken zum Umdrehen</div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)]">
                  <div className="w-full h-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">Deutsch</div>
                    <div className="text-5xl font-bold text-center">{currentCard.de}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Buttons */}
            {isFlipped && (
              <div className="flex gap-4 mt-8 animate-fade-in">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">❌ Falsch</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">✅ Richtig</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exit Study Mode */}
        <div className="text-center">
          <button
            onClick={() => {
              setViewMode('browse');
              setCurrentCardIndex(0);
              setSlideAnimation(null);
            }}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            Lernmodus beenden
          </button>
        </div>
      </div>
    );
  }

  // Browse Mode View
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Meine Lernkarten</h2>
            <p className="text-slate-500 mt-1">{stats.total} {stats.total === 1 ? 'Karte' : 'Karten'} gespeichert</p>
          </div>
          <div className="flex gap-3">
            {stats.due > 0 && (
              <button
                onClick={startStudyMode}
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">🎯 {stats.due} lernen</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            )}
            <button
              onClick={() => setViewMode('quiz')}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">🎯 Quiz starten</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
          </div>
        </div>

        {/* Box Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Box 1', value: stats.box1, color: 'from-red-500 to-rose-600', desc: '1 Tag' },
            { label: 'Box 2', value: stats.box2, color: 'from-orange-500 to-amber-600', desc: '2 Tage' },
            { label: 'Box 3', value: stats.box3, color: 'from-yellow-500 to-yellow-600', desc: '5 Tage' },
            { label: 'Box 4', value: stats.box4, color: 'from-green-500 to-emerald-600', desc: '10 Tage' },
            { label: 'Box 5', value: stats.box5, color: 'from-blue-500 to-cyan-600', desc: '30 Tage' }
          ].map((box, i) => (
            <div key={i} className={`bg-gradient-to-br ${box.color} p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105`}>
              <div className="text-3xl font-bold">{box.value}</div>
              <div className="text-xs font-medium opacity-90">{box.label}</div>
              <div className="text-xs opacity-75">{box.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {flashcards.map((card) => {
          const isCardFlipped = flippedBrowseCards.has(card.id);
          
          return (
            <div key={card.id} className="group relative">
              <div 
                className="perspective-1000 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlippedBrowseCards(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(card.id)) {
                      newSet.delete(card.id);
                    } else {
                      newSet.add(card.id);
                    }
                    return newSet;
                  });
                }}
              >
                <div 
                  className={`relative h-64 rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-700 preserve-3d ${
                    isCardFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front Side - Spanisch */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden">
                    {/* Background Image with Gradient Overlay */}
                    {card.imageUrl ? (
                      <div className="absolute inset-0">
                        <img 
                          src={card.imageUrl} 
                          alt={card.location || 'Reisebild'} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-pink-500/85 to-orange-500/80 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600"></div>
                    )}

                    {/* Box Badge */}
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl backdrop-blur-sm ${
                      card.box === 1 ? 'bg-red-500/80' :
                      card.box === 2 ? 'bg-orange-500/80' :
                      card.box === 3 ? 'bg-yellow-500/80' :
                      card.box === 4 ? 'bg-green-500/80' :
                      'bg-blue-500/80'
                    }`}>
                      {card.box}
                    </div>

                    {/* Location Badge */}
                    {card.location && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow-lg border border-white/30">
                        📍 {card.location}
                      </div>
                    )}

                    {/* Front Content - Only Spanish */}
                    <div className="relative h-full flex flex-col justify-center items-center p-6 text-white">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-4">Spanisch</div>
                      <div className="text-4xl font-black drop-shadow-2xl text-center mb-8">{card.es}</div>
                      <div className="text-xs opacity-75 animate-pulse">👆 Klicken zum Umdrehen</div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>

                  {/* Back Side - Deutsch */}
                  <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)] rounded-3xl overflow-hidden">
                    {/* Background for back side */}
                    {card.imageUrl ? (
                      <div className="absolute inset-0">
                        <img 
                          src={card.imageUrl} 
                          alt={card.location || 'Reisebild'} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 via-emerald-500/85 to-teal-500/80 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500"></div>
                    )}

                    {/* Box Badge on back */}
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl backdrop-blur-sm ${
                      card.box === 1 ? 'bg-red-500/80' :
                      card.box === 2 ? 'bg-orange-500/80' :
                      card.box === 3 ? 'bg-yellow-500/80' :
                      card.box === 4 ? 'bg-green-500/80' :
                      'bg-blue-500/80'
                    }`}>
                      {card.box}
                    </div>

                    {/* Location Badge on back */}
                    {card.location && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow-lg border border-white/30">
                        📍 {card.location}
                      </div>
                    )}

                    {/* Back Content - Only German */}
                    <div className="relative h-full flex flex-col justify-center items-center p-6 text-white">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-4">Deutsch</div>
                      <div className="text-4xl font-black drop-shadow-2xl text-center">{card.de}</div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Delete Button - Outside flip container */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(card.id);
                }}
                className="absolute top-4 left-4 p-3 bg-red-500/90 backdrop-blur-sm text-white rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-110 hover:rotate-12 z-20"
                aria-label="Lernkarte löschen"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>

      {/* Learning Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-md">
        <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span>Leitner-System: So funktioniert's</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-indigo-800">
          <div className="space-y-2">
            <p><strong>✅ Richtig beantwortet:</strong> Karte steigt in die nächste Box auf</p>
            <p><strong>❌ Falsch beantwortet:</strong> Karte geht zurück zu Box 1</p>
            <p><strong>📅 Wiederholung:</strong> Jede Box hat eigene Intervalle</p>
          </div>
          <div className="space-y-2">
            <p><strong>Box 1-2:</strong> Neue/schwierige Wörter (1-2 Tage)</p>
            <p><strong>Box 3-4:</strong> Gut gelernte Wörter (5-10 Tage)</p>
            <p><strong>Box 5:</strong> Perfekt! Wiederholung in 30 Tagen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
