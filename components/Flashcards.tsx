import React, { useState, useEffect, useMemo } from 'react';
import { SavedFlashcard, SavedEntry } from '../types';
import { loadFlashcards, deleteFlashcard, reviewFlashcard, getDueFlashcards, getFlashcardStats } from '../services/flashcardService';
import { ttsService } from '../services/ttsService';
import { TrashIcon } from './icons/TrashIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import FlashcardQuiz from './FlashcardQuiz';
import { useToast } from '../contexts/ToastContext';
import { Heading, Text, Stack, Card, Grid } from '../design-system';

type ViewMode = 'browse' | 'study' | 'quiz';
type FilterBox = 'all' | 1 | 2 | 3 | 4 | 5;
type SortMode = 'recent' | 'alphabetical' | 'box';

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState(getFlashcardStats());
  const [studyCards, setStudyCards] = useState<SavedFlashcard[]>([]);
  const [slideAnimation, setSlideAnimation] = useState<'slide-out-left' | 'slide-out-right' | 'slide-in' | null>(null);
  const [flippedBrowseCards, setFlippedBrowseCards] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBox, setFilterBox] = useState<FilterBox>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [isTTSSupported] = useState(() => ttsService.isSupported());
  const toast = useToast();

  useEffect(() => {
    refreshCards();
    
    // Cleanup TTS on unmount
    return () => {
      ttsService.stop();
    };
  }, []);

  // Filtered and sorted flashcards
  const filteredCards = useMemo(() => {
    let result = [...flashcards];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.es.toLowerCase().includes(query) || 
        card.de.toLowerCase().includes(query) ||
        (card.location && card.location.toLowerCase().includes(query))
      );
    }
    
    // Box filter
    if (filterBox !== 'all') {
      result = result.filter(card => card.box === filterBox);
    }
    
    // Sort
    switch (sortMode) {
      case 'alphabetical':
        result.sort((a, b) => a.es.localeCompare(b.es));
        break;
      case 'box':
        result.sort((a, b) => a.box - b.box);
        break;
      case 'recent':
      default:
        // Already in recent order from loadFlashcards
        break;
    }
    
    return result;
  }, [flashcards, searchQuery, filterBox, sortMode]);

  // Funktion zum Laden der Reiseeinträge aus localStorage
  const getImageForCard = (card: SavedFlashcard): string | null => {
    if (!card.entryId) return null;
    try {
      const storedEntries = localStorage.getItem('diaryEntries');
      if (storedEntries) {
        const entries: SavedEntry[] = JSON.parse(storedEntries);
        const entry = entries.find(e => e.id === card.entryId);
        return entry?.imagePreview || null;
      }
    } catch (error) {
      console.error('Fehler beim Laden des Bildes:', error);
    }
    return null;
  };

  const refreshCards = () => {
    const cards = loadFlashcards();
    setFlashcards(cards);
    setStats(getFlashcardStats());
    const due = getDueFlashcards();
    setStudyCards(due);
  };

  const handleSpeak = (text: string, cardId: string) => {
    // If already speaking this card, stop it
    if (speakingCardId === cardId && ttsService.isSpeaking()) {
      ttsService.stop();
      setSpeakingCardId(null);
      return;
    }

    // Stop any current speech and start new one
    ttsService.stop();
    setSpeakingCardId(cardId);

    ttsService.speak(
      text,
      { lang: 'es-ES', rate: 0.85 },
      () => setSpeakingCardId(cardId),
      () => setSpeakingCardId(null),
      (error) => {
        console.error('TTS Error:', error);
        setSpeakingCardId(null);
      }
    );
  };

  const handleAnswer = async (correct: boolean) => {
    if (studyCards.length === 0) return;
    
    // Stop any playing audio
    ttsService.stop();
    setSpeakingCardId(null);
    
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
      ttsService.stop();
      setSpeakingCardId(null);
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
      <Card variant="default" padding="lg" className="text-center">
        <Stack spacing="md">
          <div className="text-6xl animate-bounce">📚</div>
          <Heading level={3}>Keine Lernkarten gespeichert</Heading>
          <Text color="muted">
            Gehe zum Spanisch-Lern-Chat und speichere Lernkarten, um sie hier zu sehen!
          </Text>
        </Stack>
      </Card>
    );
  }

  // Quiz Mode View
  if (viewMode === 'quiz') {
    return (
      <Stack spacing="lg">
        <button
          onClick={() => {
            setViewMode('browse');
            refreshCards();
          }}
          className="group inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 font-medium transition-all duration-200 hover:gap-3"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <Text variant="label" as="span">Zurück zur Übersicht</Text>
        </button>
        <FlashcardQuiz onQuizComplete={refreshCards} />
      </Stack>
    );
  }

  // Study Mode View
  if (viewMode === 'study') {
    if (studyCards.length === 0) {
      return (
        <Stack spacing="lg">
          <Card variant="ghost" padding="xl" className="text-center bg-gradient-to-br from-success-50 to-emerald-50 border-2 border-success-200">
            <Stack spacing="lg">
              <div className="text-7xl animate-bounce">🎉</div>
              <Heading level={2} className="text-success-800">Perfekt!</Heading>
              <Text variant="body-large" className="text-success-700">Keine Karten sind heute fällig. Komm morgen wieder!</Text>
              <button
                onClick={() => setViewMode('browse')}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-success-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-success-700 hover:to-emerald-700"
              >
                Zurück zur Übersicht
              </button>
            </Stack>
          </Card>
        </Stack>
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
                    {isTTSSupported && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentCard.es, `study-${currentCard.id}`);
                        }}
                        className="absolute top-6 right-6 p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10 group/speaker"
                        aria-label={speakingCardId === `study-${currentCard.id}` ? 'Stoppen' : 'Anhören'}
                        title="Spanisch vorlesen"
                      >
                        <SpeakerIcon 
                          className={`w-6 h-6 ${
                            speakingCardId === `study-${currentCard.id}` 
                              ? 'text-white' 
                              : 'text-white/80 group-hover/speaker:text-white'
                          }`}
                          isPlaying={speakingCardId === `study-${currentCard.id}`}
                        />
                      </button>
                    )}
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
    <Stack spacing="lg">
      {/* Header with Stats */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-white to-neutral-50">
        <Stack spacing="lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <Heading level={1} className="mb-2">Meine Lernkarten</Heading>
              <Text color="muted">{stats.total} {stats.total === 1 ? 'Karte' : 'Karten'} gespeichert</Text>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.due > 0 && (
                <button
                  onClick={startStudyMode}
                  className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">🎯 {stats.due} lernen</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-purple-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              )}
              <button
                onClick={() => setViewMode('quiz')}
                className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">🎯 Quiz</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Spanisch, Deutsch oder Ort..."
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300 hover:shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Suche löschen"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                showFilters 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="animate-fade-in">
              <Stack spacing="md">
                <div>
                  <Text variant="label" color="secondary" className="mb-2">Nach Box filtern:</Text>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 1, 2, 3, 4, 5] as FilterBox[]).map((box) => (
                      <button
                        key={box}
                        onClick={() => setFilterBox(box)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          filterBox === box
                            ? 'bg-primary-600 text-white shadow-md scale-105'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {box === 'all' ? 'Alle' : `Box ${box}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Text variant="label" color="secondary" className="mb-2">Sortierung:</Text>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'recent' as SortMode, label: '🕐 Neueste', icon: '🕐' },
                      { value: 'alphabetical' as SortMode, label: '🔤 A-Z', icon: '🔤' },
                      { value: 'box' as SortMode, label: '📦 Box', icon: '📦' }
                    ].map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => setSortMode(sort.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          sortMode === sort.value
                            ? 'bg-primary-600 text-white shadow-md scale-105'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Stack>
            </div>
          )}

        {/* Box Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Box 1', value: stats.box1, color: 'from-error-500 to-error-600', desc: '1 Tag' },
            { label: 'Box 2', value: stats.box2, color: 'from-warning-500 to-warning-600', desc: '2 Tage' },
            { label: 'Box 3', value: stats.box3, color: 'from-yellow-500 to-yellow-600', desc: '5 Tage' },
            { label: 'Box 4', value: stats.box4, color: 'from-success-500 to-success-600', desc: '10 Tage' },
            { label: 'Box 5', value: stats.box5, color: 'from-primary-500 to-primary-600', desc: '30 Tage' }
          ].map((box, i) => (
            <div key={i} className={`bg-gradient-to-br ${box.color} p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer`}>
              <div className="text-3xl font-bold">{box.value}</div>
              <div className="text-xs font-medium opacity-90">{box.label}</div>
              <div className="text-xs opacity-75">{box.desc}</div>
            </div>
          ))}
        </div>
        </Stack>
      </Card>

      {/* Results Info */}
      {filteredCards.length !== flashcards.length && (
        <Card variant="outlined" padding="sm">
          <Text variant="small" color="secondary" className="text-center">
            {filteredCards.length} von {flashcards.length} Karten gefunden
          </Text>
        </Card>
      )}

      {/* Empty State for Filters */}
      {filteredCards.length === 0 && (
        <Card variant="ghost" padding="xl" className="text-center">
          <Stack spacing="md">
            <div className="text-6xl">🔍</div>
            <Heading level={4}>Keine Karten gefunden</Heading>
            <Text color="muted">Versuche andere Filter oder Suchbegriffe</Text>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBox('all');
              }}
              className="mx-auto px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Filter zurücksetzen
            </button>
          </Stack>
        </Card>
      )}

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => {
          const isCardFlipped = flippedBrowseCards.has(card.id);
          const cardImage = getImageForCard(card);
          
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
                    {cardImage ? (
                      <div className="absolute inset-0">
                        <img 
                          src={cardImage} 
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
                      {isTTSSupported && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(card.es, card.id);
                          }}
                          className="absolute top-20 right-6 p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10 group/speaker"
                          aria-label={speakingCardId === card.id ? 'Stoppen' : 'Anhören'}
                          title="Spanisch vorlesen"
                        >
                          <SpeakerIcon 
                            className={`w-5 h-5 ${
                              speakingCardId === card.id 
                                ? 'text-white' 
                                : 'text-white/80 group-hover/speaker:text-white'
                            }`}
                            isPlaying={speakingCardId === card.id}
                          />
                        </button>
                      )}
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-4">Spanisch</div>
                      <div className="text-4xl font-black drop-shadow-2xl text-center mb-8">{card.es}</div>
                      <div className="text-xs opacity-75 animate-pulse">👆 Klicken zum Umdrehen</div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>

                  {/* Back Side - Deutsch */}
                  <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)] rounded-3xl overflow-hidden">
                    {/* Background for back side - nur Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500"></div>

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
      <Card variant="ghost" padding="lg" className="bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
        <Stack spacing="md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <Heading level={4} className="mb-0 text-primary-900">Leitner-System: So funktioniert's</Heading>
          </div>
          <Grid cols={2} gap="md">
            <Stack spacing="sm">
              <Text variant="small" className="text-primary-800"><strong>✅ Richtig beantwortet:</strong> Karte steigt in die nächste Box auf</Text>
              <Text variant="small" className="text-primary-800"><strong>❌ Falsch beantwortet:</strong> Karte geht zurück zu Box 1</Text>
              <Text variant="small" className="text-primary-800"><strong>📅 Wiederholung:</strong> Jede Box hat eigene Intervalle</Text>
            </Stack>
            <Stack spacing="sm">
              <Text variant="small" className="text-primary-800"><strong>Box 1-2:</strong> Neue/schwierige Wörter (1-2 Tage)</Text>
              <Text variant="small" className="text-primary-800"><strong>Box 3-4:</strong> Gut gelernte Wörter (5-10 Tage)</Text>
              <Text variant="small" className="text-primary-800"><strong>Box 5:</strong> Perfekt! Wiederholung in 30 Tagen</Text>
            </Stack>
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
};

export default Flashcards;
