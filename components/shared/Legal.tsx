import React from 'react';

interface LegalProps {
    onBack?: () => void;
}

const Legal: React.FC<LegalProps> = ({ onBack }) => {
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
                    <h1 className="text-3xl font-bold text-neutral-800 mb-6">Rechtliche Hinweise</h1>
                    
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Impressum</h2>
                        <div className="text-neutral-600 space-y-2">
                            <p><strong>Angaben gemäß § 5 TMG:</strong></p>
                            <p>Stefan Helldobler</p>
                            <p>Web Developer</p>
                            <p className="mt-4"><strong>Kontakt:</strong></p>
                            <p>E-Mail: info@stefan-helldobler.de</p>
                            <p>Website: <a href="https://stefan-helldobler.de" className="text-primary-500 hover:underline">stefan-helldobler.de</a></p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Datenschutzerklärung</h2>
                        <div className="text-neutral-600 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">1. Datenschutz auf einen Blick</h3>
                                <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese App nutzen.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">2. Allgemeine Hinweise und Pflichtinformationen</h3>
                                <p>Die Betreiber dieser App nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">3. Datenerfassung</h3>
                                <p><strong>Firebase Authentication:</strong> Diese App verwendet Firebase für die Authentifizierung. Dabei werden E-Mail-Adresse und verschlüsselte Passwörter gespeichert.</p>
                                <p className="mt-2"><strong>Lokale Datenspeicherung:</strong> Tagebucheinträge und Lernkarten werden lokal in Ihrem Browser gespeichert (LocalStorage).</p>
                                <p className="mt-2"><strong>Google Gemini API:</strong> Bilder und Texte werden zur Analyse an die Google Gemini API übermittelt.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">4. Ihre Rechte</h3>
                                <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">5. Cookies und lokale Speicherung</h3>
                                <p>Die App verwendet LocalStorage zur lokalen Speicherung Ihrer Daten. Diese Daten verlassen Ihr Gerät nicht, außer bei der Nutzung der KI-Funktionen.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Haftungsausschluss</h2>
                        <div className="text-neutral-600 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Haftung für Inhalte</h3>
                                <p>Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Haftung für Links</h3>
                                <p>Die App kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Urheberrecht</h2>
                        <p className="text-neutral-600">
                            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser App unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Legal;
