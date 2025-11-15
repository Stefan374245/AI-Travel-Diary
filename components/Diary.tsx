import React, { useState } from 'react';
import { SavedEntry } from '../types';
import Quiz from './Quiz';
import { TrashIcon } from './icons/TrashIcon';

interface DiaryProps {
  entries: SavedEntry[];
  onDeleteEntry: (id: string) => void;
}

const Diary: React.FC<DiaryProps> = ({ entries, onDeleteEntry }) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEntryId(prevId => (prevId === id ? null : id));
  };

  if (entries.length === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-slate-700">Dein Tagebuch ist leer.</h2>
        <p className="mt-2 text-slate-500">Erstelle deinen ersten Reiseeintrag, um ihn hier zu sehen!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Mein Tagebuch</h2>
      {entries.map(entry => (
        <div key={entry.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center" onClick={() => toggleExpand(entry.id)}>
            <div className="flex items-center gap-4">
              <img src={entry.imagePreview} alt={entry.location} className="h-16 w-16 object-cover rounded-md flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-lg text-slate-800 truncate">{entry.location}</h3>
                <p className="text-sm text-slate-500">{new Date(entry.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                  }}
                  className="p-2 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Eintrag löschen"
              >
                <TrashIcon />
              </button>
               <svg className={`h-5 w-5 text-slate-500 ml-2 transform transition-transform ${expandedEntryId === entry.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {expandedEntryId === entry.id && (
            <div className="p-6 border-t border-slate-200 space-y-8 bg-slate-50/50 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Kurzbeschreibung (DE)</h3>
                <p className="text-slate-600">{entry.analysisResult.description_de}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Descripción (ES)</h3>
                <p className="text-slate-600 italic">{entry.analysisResult.description_es}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Vokabeln (ES → DE)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Spanisch</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deutsch</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {entry.analysisResult.vocab.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{v.es}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{v.de}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quiz: Teste dein Wissen!</h3>
                <Quiz quizData={entry.analysisResult.quiz} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.analysisResult.labels.map((label, i) => (
                    <span key={i} className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">{label}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Diary;