import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import ImageAnalyzer from './components/image-analyzer/ImageAnalyzer';
import Chat from './components/chat/Chat';
import Diary from './components/diary/Diary';
import Flashcards from './components/flashcards/Flashcards';
import Legal from './components/shared/Legal';
import Help from './components/shared/Help';
import UserMenu from './components/shared/UserMenu';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import { CameraIcon } from './components/icons/CameraIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { CardIcon } from './components/icons/CardIcon';
import { SavedEntry } from './types';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import { TutorialProvider, TutorialOverlay } from './components/tutorial';
import TutorialButton from './components/tutorial/components/TutorialButton';


type Tab = 'analyzer' | 'chat' | 'diary' | 'flashcards' | 'legal' | 'help';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuth();

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
    setExpandedEntryId(newEntry.id);
    setActiveTab('diary');
    // Scroll zum neuen Eintrag nach Tab-Wechsel
    setTimeout(() => {
      const element = document.getElementById(`entry-${newEntry.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      const updatedEntries = savedEntries.filter(entry => entry.id !== id);
      setSavedEntries(updatedEntries);
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    }
  };

  const handleUpdateEntry = (updatedEntry: SavedEntry) => {
    const updatedEntries = savedEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setSavedEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
  };


  const renderContent = () => {
    // Show Login/SignUp if not authenticated
    if (!currentUser) {
      return showSignUp ? 
        <SignUp onToggle={() => setShowSignUp(false)} /> : 
        <Login onToggle={() => setShowSignUp(true)} />;
    }

    // Show regular content when authenticated
    switch (activeTab) {
      case 'analyzer':
        return <ImageAnalyzer onSaveEntry={handleSaveEntry} />;
      case 'chat':
        return <Chat savedEntries={savedEntries} />;
      case 'diary':
        return <Diary entries={savedEntries} onDeleteEntry={handleDeleteEntry} onUpdateEntry={handleUpdateEntry} expandedEntryId={expandedEntryId} setExpandedEntryId={setExpandedEntryId} />;
      case 'flashcards':
        return <Flashcards />;
      case 'legal':
        return <Legal onBack={() => setActiveTab('analyzer')} />;
      case 'help':
        return <Help onBack={() => setActiveTab('analyzer')} />;
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
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center">
                <TutorialButton />
              </div>
              <div className="flex flex-col items-center flex-1">
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 tracking-tight text-center cursor-pointer hover:text-primary-500 transition-colors"
                  onClick={() => currentUser && setActiveTab('analyzer')}
                >
                  <span className="text-primary-500">AI</span> Travel Diary
                </h1>
                <p className="hidden md:block text-center text-neutral-500 mt-1 text-sm whitespace-nowrap">Dein smarter Begleiter für unvergessliche Reisen & Spanischlernen</p>
              </div>
              <div className="flex items-center">
                <UserMenu onNavigate={(page) => setActiveTab(page)} />
              </div>
            </div>
          </div>
        </header>

      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Nur Tab-Bar anzeigen, wenn nicht auf Legal oder Help Seite UND wenn eingeloggt */}
          {currentUser && activeTab !== 'legal' && activeTab !== 'help' && (
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md mb-6 sticky top-[85px] sm:top-[105px] z-10" data-tutorial="tab-bar">
              <div className="flex space-x-2">
                <TabButton tabName="analyzer" label="Reiseeintrag erstellen" icon={<CameraIcon />} />
                <TabButton tabName="diary" label="Mein Tagebuch" icon={<BookOpenIcon />} />
                <TabButton tabName="chat" label="Spanisch-Lern-Chat" icon={<ChatBubbleIcon />} />
                <TabButton tabName="flashcards" label="Lernkarten" icon={<CardIcon />} />
              </div>
            </div>
          )}

          <div className="mt-6 mb-8">
            {renderContent()}
          </div>
        </div>
      </main>
      
      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
            
            {/* Left - Name & Title */}
            <div className="flex flex-col items-center sm:items-start">
              <a 
                href="https://stefan-helldobler.de/portfolio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                  Stefan Helldobler
                </span>
              </a>
              <span className="text-xs text-slate-400 mt-1">Web Developer</span>
            </div>

            {/* Center - App Info */}
            <div className="flex flex-col items-center text-center">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Travel Diary</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lerne Spanisch auf deinen Reisen mit KI-gestützter Bildanalyse
              </p>
              <span className="text-xs text-slate-600 mt-2">
                Powered by <span className="font-mono text-purple-400">Gemini API</span>
              </span>
            </div>

            {/* Right - Contact */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <a 
                href="mailto:info@stefan-helldobler.de" 
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-purple-400 transition-colors group"
              >
                <img 
                  src="/mail.svg" 
                  alt="Email" 
                  className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span className="hidden sm:inline">info@stefan-helldobler.de</span>
                <span className="sm:hidden">Kontakt</span>
              </a>
              <a 
                href="https://stefan-helldobler.de/portfolio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-purple-400 transition-colors"
              >
                Weitere Projekte →
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Stefan Helldobler. Alle Rechte vorbehalten.</p>
              <div className="flex gap-3">
                <a href="#" className="hover:text-purple-400 transition-colors">Datenschutz</a>
                <span className="text-slate-700">•</span>
                <a href="#" className="hover:text-purple-400 transition-colors">Impressum</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
      <TutorialOverlay />
    </TutorialProvider>
  );
};

export default App;