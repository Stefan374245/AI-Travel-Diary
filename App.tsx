import React, { useState, useEffect } from 'react';
import ImageAnalyzer from './components/ImageAnalyzer';
import Chat from './components/Chat';
import Diary from './components/Diary';
import Flashcards from './components/Flashcards';
import { CameraIcon } from './components/icons/CameraIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { CardIcon } from './components/icons/CardIcon';
import { SavedEntry } from './types';
import { useToast } from './contexts/ToastContext';
import { TutorialProvider, TutorialOverlay } from './components/tutorial';
import TutorialButton from './components/tutorial/components/TutorialButton';


type Tab = 'analyzer' | 'chat' | 'diary' | 'flashcards';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const toast = useToast();

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('diaryEntries');
      if (storedEntries) {
        setSavedEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to load diary entries from localStorage", error);
    }
  }, []);

  const handleSaveEntry = (newEntryData: Omit<SavedEntry, 'id' | 'timestamp'>) => {
    const newEntry: SavedEntry = {
      ...newEntryData,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...savedEntries];
    setSavedEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    setActiveTab('diary');
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      const updatedEntries = savedEntries.filter(entry => entry.id !== id);
      setSavedEntries(updatedEntries);
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return <ImageAnalyzer onSaveEntry={handleSaveEntry} />;
      case 'chat':
        return <Chat savedEntries={savedEntries} />;
      case 'diary':
        return <Diary entries={savedEntries} onDeleteEntry={handleDeleteEntry} />;
      case 'flashcards':
        return <Flashcards />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => {
    const tutorialId = `tab-${tabName}`;
    return (
      <button
        data-tutorial={tutorialId}
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md ${
          activeTab === tabName
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <TutorialProvider autoStart={true}>
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4 relative">
              <div className="absolute left-0">
                <TutorialButton />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 tracking-tight text-center">
                  <span className="text-primary-500">AI</span> Travel Diary
                </h1>
                <p className="hidden sm:block text-center text-neutral-500 mt-1 text-xs sm:text-sm whitespace-nowrap">Dein smarter Begleiter für unvergessliche Reisen & Spanischlernen</p>
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md mb-6 sticky top-[90px] sm:top-[105px] z-10" data-tutorial="tab-bar">
          <div className="flex space-x-2">
            <TabButton tabName="analyzer" label="Reiseeintrag erstellen" icon={<CameraIcon />} />
            <TabButton tabName="diary" label="Mein Tagebuch" icon={<BookOpenIcon />} />
            <TabButton tabName="chat" label="Spanisch-Lern-Chat" icon={<ChatBubbleIcon />} />
            <TabButton tabName="flashcards" label="Lernkarten" icon={<CardIcon />} />
          </div>
        </div>

        <div className="mt-6">
          {renderContent()}
        </div>
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8">
        <p className="text-center text-xs text-slate-400">Powered by Gemini API</p>
      </footer>
      </div>
      <TutorialOverlay />
    </TutorialProvider>
  );
};

export default App;