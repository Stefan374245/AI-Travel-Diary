import React, { useState, useEffect } from 'react';
import { SavedFlashcard } from '../types';
import { loadFlashcards } from '../services/flashcardService';
import { useToast } from '../contexts/ToastContext';

const FlashcardQuiz: React.FC = () => {
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    question: string;
    correct: string;
    options: string[];
    imageUrl?: string;
    location?: string;
  }>>([]);
  const toast = useToast();

  useEffect(() => {
    const cards = loadFlashcards();
    setFlashcards(cards);
  }, []);

  const generateQuiz = (numQuestions: number = 10) => {
    if (flashcards.length < 4) {
      toast.warning('Du brauchst mindestens 4 Lernkarten, um ein Quiz zu starten!');
      return;
    }

    // Zufällige Karten auswählen
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, Math.min(numQuestions, flashcards.length));

    const questions = selectedCards.map(card => {
      // Erstelle falsche Antworten aus anderen Karten
      const wrongAnswers = flashcards
        .filter(c => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.de);

      // Mische Antworten
      const options = [card.de, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        question: card.es,
        correct: card.de,
        options,
        imageUrl: card.imageUrl,
        location: card.location,
      };
    });

    setQuizQuestions(questions);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    if (answer === quizQuestions[currentQuestionIndex].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700">Keine Lernkarten vorhanden</h2>
        <p className="mt-2 text-slate-500">
          Speichere zuerst einige Lernkarten im Spanisch-Chat!
        </p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-12 rounded-3xl shadow-2xl text-white text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-4xl font-black mb-4">Vokabel-Quiz</h2>
          <p className="text-xl opacity-95 mb-8">
            Teste dein Wissen mit {flashcards.length} Lernkarten!
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { num: 5, label: 'Schnell' },
              { num: 10, label: 'Standard' },
              { num: 20, label: 'Intensiv' }
            ].map(({ num, label }) => (
              <button
                key={num}
                onClick={() => generateQuiz(num)}
                disabled={flashcards.length < num}
                className="group relative overflow-hidden bg-white/20 backdrop-blur-lg hover:bg-white/30 p-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/30"
              >
                <div className="text-4xl font-black mb-2">{num}</div>
                <div className="text-sm uppercase tracking-wider">{label}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            ))}
          </div>

          <div className="text-sm opacity-75">
            💡 Fragen werden zufällig aus deinen gespeicherten Karten generiert
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-slate-800 mb-4">📊 Deine Statistik</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-center">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-indigo-600">{flashcards.length}</div>
              <div className="text-sm text-slate-600">Gesamt Karten</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                {flashcards.filter(c => c.box >= 4).length}
              </div>
              <div className="text-sm text-slate-600">Gut gelernt (Box 4-5)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const isGood = percentage >= 70;

    return (
      <div className="space-y-6">
        <div className={`p-12 rounded-3xl shadow-2xl text-white text-center ${
          isGood 
            ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500' 
            : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
        }`}>
          <div className="text-8xl mb-6">{isGood ? '🎉' : '💪'}</div>
          <h2 className="text-5xl font-black mb-4">
            {isGood ? '¡Excelente!' : '¡Sigue practicando!'}
          </h2>
          <div className="text-7xl font-black mb-6">{score} / {quizQuestions.length}</div>
          <div className="text-3xl font-bold mb-8">{percentage}%</div>
          
          <button
            onClick={restartQuiz}
            className="group relative overflow-hidden bg-white text-slate-800 px-12 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <span className="relative z-10">🔄 Neues Quiz starten</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-slate-700">
            Frage {currentQuestionIndex + 1} / {quizQuestions.length}
          </span>
          <span className="text-sm text-slate-500">Score: {score}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative">
        {currentQuestion.imageUrl && (
          <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl mb-6">
            <img 
              src={currentQuestion.imageUrl} 
              alt={currentQuestion.location || 'Quiz'} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            {currentQuestion.location && (
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full text-white font-semibold border border-white/30">
                📍 {currentQuestion.location}
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 rounded-3xl shadow-2xl text-white text-center mb-6">
          <div className="text-sm font-bold uppercase tracking-widest opacity-90 mb-4">
            Was bedeutet auf Deutsch?
          </div>
          <div className="text-6xl font-black mb-2">{currentQuestion.question}</div>
        </div>

        {/* Answer Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct;
            const showFeedback = selectedAnswer !== null;

            return (
              <button
                key={index}
                onClick={() => !selectedAnswer && handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`group relative overflow-hidden p-8 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed ${
                  !showFeedback 
                    ? 'bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 text-slate-800 shadow-lg hover:shadow-2xl' 
                    : isSelected && isCorrect 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl scale-105' 
                    : isSelected && !isCorrect 
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-2xl' 
                    : isCorrect 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl' 
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {showFeedback && isCorrect && '✅'}
                  {showFeedback && isSelected && !isCorrect && '❌'}
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlashcardQuiz;
