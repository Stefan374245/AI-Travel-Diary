import React from 'react';

interface HelpProps {
    onBack?: () => void;
}

const Help: React.FC<HelpProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-4 flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Zurück</span>
                    </button>
                )}
                
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                    <h1 className="text-3xl font-bold text-neutral-800 mb-6">Hilfe & Anleitung</h1>
                    
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Willkommen bei AI Travel Diary</h2>
                        <p className="text-neutral-600 mb-4">
                            AI Travel Diary ist dein intelligenter Begleiter zum Spanischlernen auf Reisen. 
                            Nutze die Kraft der KI, um Bilder zu analysieren, interaktiv zu lernen und deine Reiseerlebnisse festzuhalten.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Funktionen im Überblick</h2>
                        
                        <div className="space-y-6">
                            <div className="border-l-4 border-primary-500 pl-4">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">📸 Reiseeintrag erstellen</h3>
                                <p className="text-neutral-600 mb-2">Lade ein Bild hoch oder mache ein Foto von deiner Reise:</p>
                                <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                                    <li>Die KI analysiert dein Bild automatisch</li>
                                    <li>Du erhältst eine Beschreibung auf Deutsch und Spanisch</li>
                                    <li>Wichtige Vokabeln werden für dich extrahiert</li>
                                    <li>Speichere den Eintrag in deinem Tagebuch</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-primary-500 pl-4">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">📖 Mein Tagebuch</h3>
                                <p className="text-neutral-600 mb-2">Verwalte deine gespeicherten Reiseeinträge:</p>
                                <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                                    <li>Durchsuche alle deine Einträge</li>
                                    <li>Bearbeite Beschreibungen und Titel</li>
                                    <li>Höre dir Vokabeln mit Text-to-Speech an</li>
                                    <li>Visualisiere deine Reiseroute auf einer Karte</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-primary-500 pl-4">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">💬 Spanisch-Lern-Chat</h3>
                                <p className="text-neutral-600 mb-2">Übe Spanisch mit deinem persönlichen KI-Tutor:</p>
                                <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                                    <li>Stelle Fragen zu deinen Tagebucheinträgen</li>
                                    <li>Lerne Vokabeln im Kontext</li>
                                    <li>Erhalte Erklärungen zu Grammatik</li>
                                    <li>Übe Konversationen auf Spanisch</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-primary-500 pl-4">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">🎴 Lernkarten</h3>
                                <p className="text-neutral-600 mb-2">Trainiere deinen Wortschatz spielerisch:</p>
                                <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                                    <li>Erstelle Lernkarten aus deinen Einträgen</li>
                                    <li>Übe mit dem interaktiven Quiz-Modus</li>
                                    <li>Verfolge deinen Lernfortschritt</li>
                                    <li>Wiederhole schwierige Vokabeln</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Tipps für die beste Nutzung</h2>
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-primary-600 font-bold">💡</span>
                                <p className="text-neutral-700">
                                    <strong>Klare Fotos:</strong> Mache gut beleuchtete Fotos für bessere KI-Analysen.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary-600 font-bold">💡</span>
                                <p className="text-neutral-700">
                                    <strong>Regelmäßiges Üben:</strong> Wiederhole die Lernkarten täglich für nachhaltigen Erfolg.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary-600 font-bold">💡</span>
                                <p className="text-neutral-700">
                                    <strong>Chat nutzen:</strong> Stelle Fragen, wenn du etwas nicht verstehst – die KI hilft dir weiter.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary-600 font-bold">💡</span>
                                <p className="text-neutral-700">
                                    <strong>Tutorial:</strong> Klicke auf den Tutorial-Button für eine interaktive Einführung.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Häufig gestellte Fragen (FAQ)</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Wo werden meine Daten gespeichert?</h3>
                                <p className="text-neutral-600">
                                    Deine Tagebucheinträge werden lokal in deinem Browser gespeichert. 
                                    Nur zur KI-Analyse werden Bilder temporär an die Google Gemini API gesendet.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Kann ich offline arbeiten?</h3>
                                <p className="text-neutral-600">
                                    Du kannst deine gespeicherten Einträge offline ansehen. 
                                    Für neue Analysen und den Chat benötigst du eine Internetverbindung.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Wie lösche ich einen Eintrag?</h3>
                                <p className="text-neutral-600">
                                    Gehe zu "Mein Tagebuch", klicke auf den gewünschten Eintrag und nutze den Löschen-Button.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Unterstützt die App andere Sprachen?</h3>
                                <p className="text-neutral-600">
                                    Aktuell ist die App auf Spanisch-Lernen spezialisiert. 
                                    Weitere Sprachen können in zukünftigen Updates hinzugefügt werden.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Kontakt & Support</h2>
                        <p className="text-neutral-600 mb-4">
                            Hast du Fragen, Feedback oder Probleme? Ich helfe dir gerne weiter!
                        </p>
                        <div className="bg-neutral-100 rounded-lg p-4">
                            <p className="text-neutral-700">
                                <strong>E-Mail:</strong>{' '}
                                <a href="mailto:info@stefan-helldobler.de" className="text-primary-500 hover:underline">
                                    info@stefan-helldobler.de
                                </a>
                            </p>
                            <p className="text-neutral-700 mt-2">
                                <strong>Portfolio:</strong>{' '}
                                <a 
                                    href="https://stefan-helldobler.de/portfolio" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-500 hover:underline"
                                >
                                    stefan-helldobler.de
                                </a>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Help;
