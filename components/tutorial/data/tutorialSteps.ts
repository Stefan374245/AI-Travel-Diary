/**
 * Tutorial Steps Configuration
 * Defines all interactive tutorial steps with their properties
 */

import { TutorialStep } from '../types';

export const tutorialSteps: TutorialStep[] = [
  // Step 1: Welcome
  {
    id: 'welcome',
    title: '🎉 Willkommen bei AI Travel Diary!',
    description: 'Entdecke die vier Hauptbereiche dieser App: Reiseeinträge erstellen, Tagebuch, Spanisch-Chat und Lernkarten. Lass uns einen kurzen Rundgang machen!',
    tooltipPosition: 'center',
    showProgress: true,
    autoAdvanceDelay: 0,
  },

  // Step 2: Analyzer Tab
  {
    id: 'analyzer-tab',
    title: '📸 Reiseeintrag erstellen',
    description: 'Hier kannst du Fotos von deinen Reisen hochladen. Die KI analysiert deine Bilder und erstellt automatisch spanische Beschreibungen, Vokabeln und Quiz-Fragen zum Üben!',
    targetSelector: '[data-tutorial="tab-analyzer"]',
    tooltipPosition: 'bottom',
    spotlightPadding: 12,
    showProgress: true,
    beforeStep: async () => {
      const analyzerTab = document.querySelector('[data-tutorial="tab-analyzer"]') as HTMLButtonElement;
      if (analyzerTab) analyzerTab.click();
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },

  // Step 3: Diary Tab
  {
    id: 'diary-tab',
    title: '📖 Mein Tagebuch',
    description: 'Alle deine gespeicherten Reiseeinträge findest du hier. Du kannst sie jederzeit wieder aufrufen, durchstöbern und einzelne Vokabeln zu deinen Lernkarten hinzufügen.',
    targetSelector: '[data-tutorial="tab-diary"]',
    tooltipPosition: 'bottom',
    spotlightPadding: 12,
    showProgress: true,
    beforeStep: async () => {
      const diaryTab = document.querySelector('[data-tutorial="tab-diary"]') as HTMLButtonElement;
      if (diaryTab) diaryTab.click();
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },

  // Step 4: Chat Tab
  {
    id: 'chat-tab',
    title: '💬 Spanisch-Lern-Chat',
    description: 'Übe Spanisch mit einem KI-Tutor! Wähle dein Sprachniveau (A1-C2) und chatte auf Spanisch. Der Tutor passt sich deinem Level an, korrigiert Fehler und gibt dir nützliches Feedback.',
    targetSelector: '[data-tutorial="tab-chat"]',
    tooltipPosition: 'bottom',
    spotlightPadding: 12,
    showProgress: true,
    beforeStep: async () => {
      const chatTab = document.querySelector('[data-tutorial="tab-chat"]') as HTMLButtonElement;
      if (chatTab) chatTab.click();
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },

  // Step 5: Flashcards Tab
  {
    id: 'flashcards-tab',
    title: '🎴 Lernkarten',
    description: 'Alle gespeicherten Vokabeln werden hier als Lernkarten organisiert. Du kannst sie durchstöbern, lernen und mit einem Quiz testen!',
    targetSelector: '[data-tutorial="tab-flashcards"]',
    tooltipPosition: 'bottom',
    spotlightPadding: 12,
    showProgress: true,
    beforeStep: async () => {
      const flashcardsTab = document.querySelector('[data-tutorial="tab-flashcards"]') as HTMLButtonElement;
      if (flashcardsTab) flashcardsTab.click();
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },

  // Step 6: Leitner System
  {
    id: 'leitner-system',
    title: '📊 Das Leitner-System',
    description: 'So funktioniert effizientes Lernen:\n\n✅ Richtige Antwort → eine Box höher\n❌ Falsche Antwort → zurück zu Box 1\n📈 Höhere Boxen → seltener abgefragt\n\nStarte in Box 1 und arbeite dich hoch bis Box 5!',
    tooltipPosition: 'center',
    showProgress: true,
  },

  // Step 7: Complete
  {
    id: 'tutorial-complete',
    title: '✅ Fertig!',
    description: 'Das war\'s! Du kennst jetzt alle vier Bereiche. Starte mit einem Foto, übe mit dem Chat und lerne Vokabeln mit den Lernkarten. Viel Spaß beim Reisen und Spanischlernen! 🚀',
    tooltipPosition: 'center',
    showProgress: false,
    autoAdvanceDelay: 0,
    beforeStep: async () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await new Promise(resolve => setTimeout(resolve, 150));
    },
    afterStep: async () => {
      // Switch back to analyzer tab
      const analyzerTab = document.querySelector('[data-tutorial="tab-analyzer"]') as HTMLButtonElement;
      if (analyzerTab) analyzerTab.click();
    },
  },
];

/**
 * Get step by ID
 */
export const getStepById = (stepId: string): TutorialStep | undefined => {
  return tutorialSteps.find(step => step.id === stepId);
};

/**
 * Get total number of steps
 */
export const getTotalSteps = (): number => {
  return tutorialSteps.length;
};
