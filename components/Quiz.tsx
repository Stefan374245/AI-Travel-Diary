
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  quizData: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ quizData }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(
    Array(quizData.length).fill(null)
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getOptionClass = (questionIndex: number, option: string) => {
    if (!submitted) {
      return selectedAnswers[questionIndex] === option
        ? 'bg-indigo-200 border-indigo-400'
        : 'bg-white hover:bg-slate-100 border-slate-300';
    }

    const isCorrect = option === quizData[questionIndex].correct;
    const isSelected = option === selectedAnswers[questionIndex];

    if (isCorrect) {
      return 'bg-green-100 border-green-400 text-green-800';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-400 text-red-800';
    }
    return 'bg-slate-50 border-slate-300 text-slate-500';
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === quizData[index].correct ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
      {quizData.map((q, qIndex) => (
        <div key={qIndex}>
          <p className="font-medium text-slate-700 mb-3">{qIndex + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                onClick={() => handleSelectAnswer(qIndex, option)}
                className={`w-full text-left p-3 border rounded-md transition-colors text-sm ${getOptionClass(qIndex, option)}`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-6 text-center">
        {submitted ? (
          <div className="p-4 bg-indigo-100 text-indigo-800 rounded-lg">
            <p className="font-semibold text-lg">Dein Ergebnis: {calculateScore()} / {quizData.length}</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.some(a => a === null)}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Antworten prüfen
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
