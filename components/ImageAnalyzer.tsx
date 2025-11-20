import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage } from '../services/geminiService';
import { ImageAnalysisResult, SavedEntry, Coordinates } from '../types';
import Quiz from './Quiz';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useToast } from '../contexts/ToastContext';
import { Heading, Text, Stack, Card, Grid, Divider } from '../design-system';

interface ImageAnalyzerProps {
  onSaveEntry: (entryData: Omit<SavedEntry, 'id' | 'timestamp'>) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onSaveEntry }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [citySearchInput, setCitySearchInput] = useState<string>('');
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const toast = useToast();

  // Automatisch Ort aus Analyse übernehmen
  useEffect(() => {
    if (result?.location && !location) {
      setLocation(result.location);
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
      setIsSaved(false);
    }
  };
  
  const handleSave = () => {
    if (result && imagePreview && location && !isSaved) {
      const entryData = {
        imagePreview,
        location,
        analysisResult: result,
        coordinates: coordinates || undefined,
      };
      onSaveEntry(entryData);
      setIsSaved(true);
      toast.success('Reiseeintrag wurde gespeichert! 🎉');
    }
  };

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation wird von deinem Browser nicht unterstützt');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);
        
        // Reverse Geocoding: Koordinaten → Stadt/Adresse
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'de' // Deutsche Ortsnamen bevorzugen
              }
            }
          );
          const data = await response.json();
          
          if (data && data.address) {
            // Formatiere Adresse: Präziseste verfügbare Information verwenden
            const address = data.address;
            const parts = [];
            
            // Priorität: municipality/town/village > suburb > city
            if (address.municipality) {
              parts.push(address.municipality);
            } else if (address.town || address.village) {
              parts.push(address.town || address.village);
            } else if (address.city) {
              parts.push(address.city);
            } else if (address.suburb) {
              parts.push(address.suburb);
            }
            
            // Füge Region/Provinz hinzu falls vorhanden und anders als Stadt
            if (address.state && !parts.includes(address.state)) {
              parts.push(address.state);
            }
            
            if (address.country) {
              parts.push(address.country);
            }
            
            const locationName = parts.join(', ') || data.display_name;
            setLocation(locationName);
            setCitySearchInput(locationName);
            toast.success(`📍 Standort erkannt: ${parts[0] || 'Unbekannt'}. Du kannst den Ort bei Bedarf anpassen.`);
          } else {
            toast.success('Standort erfolgreich ermittelt! 📍 Bitte überprüfe den Ortsnamen.');
          }
        } catch (error) {
          console.error('Reverse Geocoding Fehler:', error);
          toast.success('Koordinaten erfolgreich ermittelt! 📍 Bitte gib den Ortsnamen manuell ein.');
        }
        
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Standort konnte nicht ermittelt werden';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standortinformationen sind nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'Zeitüberschreitung bei der Standortermittlung';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true, // Höhere Genauigkeit aktivieren
        timeout: 10000, // 10 Sekunden Timeout
        maximumAge: 0 // Keine gecachten Positionen verwenden
      }
    );
  };

  const handleCitySearch = async () => {
    if (!citySearchInput.trim()) {
      toast.error('Bitte gib einen Städtenamen ein');
      return;
    }

    setGettingLocation(true);
    try {
      // Nominatim Geocoding API (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearchInput)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setCoordinates({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
        // Optional: Ortsfeld mit gefundenem Namen aktualisieren
        if (result.display_name) {
          const parts = result.display_name.split(',');
          setLocation(parts.slice(0, 2).join(',').trim());
        }
        toast.success('Stadt gefunden! 📍');
      } else {
        toast.error('Stadt nicht gefunden. Versuche es mit einem anderen Namen.');
      }
    } catch (error) {
      toast.error('Fehler bei der Stadtsuche');
    } finally {
      setGettingLocation(false);
    }
  };


  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleSubmit = useCallback(async () => {
    if (!imagePreview || !location) {
      toast.warning('Bitte wähle ein Bild aus und gib einen Ort an.');
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError(null);
    setResult(null);
    setIsSaved(false);

    // Simulate smooth progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      if (!imageFile) {
        throw new Error('No image file selected');
      }
      const imageData = await fileToGenerativePart(imageFile);
      const analysisResult = await analyzeImage(imageData.inlineData.data, imageData.inlineData.mimeType, location);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setResult(analysisResult);
        toast.success('Bildanalyse erfolgreich abgeschlossen! ✨');
      }, 200);
    } catch (err) {
      console.error(err);
      const errorMsg = 'Fehler bei der Analyse des Bildes. Bitte versuche es erneut.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [imageFile, imagePreview, location, toast]);

  return (
    <Stack spacing="lg" className="max-w-4xl mx-auto">
      {/* Upload Section */}
      <Card variant="elevated">
        <Stack spacing="md">
          <Heading level={3}>Lade dein Reisefoto hoch</Heading>
          
          <Grid cols={2} gap="md" className="items-start">
            {/* File Upload */}
            <div>
              <Text variant="label" as="label" htmlFor="file-upload" className="block mb-2">
                Foto
              </Text>
              <div data-tutorial="upload-area" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-lg hover:border-primary-400 transition-colors duration-200">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
                  ) : (
                    <UploadIcon />
                  )}
                  <div className="flex text-sm text-neutral-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors"
                    >
                      <span>Lade eine Datei hoch</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <Text variant="small" color="secondary" as="span" className="pl-1">
                      oder ziehe sie hierher
                    </Text>
                  </div>
                  <Text variant="meta" color="muted">
                    PNG, JPG, GIF bis zu 10MB
                  </Text>
                </div>
              </div>
            </div>

            {/* Coordinates Input */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <Text variant="label" className="block mb-3">
                Standort hinzufügen
              </Text>
              
              <div className="space-y-3">
                {/* Auto-detect location */}
                <button
                  type="button"
                  onClick={handleAutoLocation}
                  disabled={gettingLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {gettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin"></div>
                      Standort wird ermittelt...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Aktuellen Standort verwenden
                    </>
                  )}
                </button>

                {/* City/Location search input */}
                <div className="space-y-2">
                  <Text variant="small" className="block mb-1 text-neutral-600">
                    Stadt oder Adresse suchen
                  </Text>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                      className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="z.B. Barcelona, Paris, Berlin"
                    />
                    <button
                      type="button"
                      onClick={handleCitySearch}
                      disabled={!citySearchInput.trim() || gettingLocation}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {gettingLocation ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                      Suchen
                    </button>
                  </div>
                  <Text variant="small" color="muted">
                    Gib eine Stadt oder Adresse ein, um Koordinaten automatisch zu finden
                  </Text>
                </div>

                {/* Display current coordinates */}
                {coordinates && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <Text variant="small" className="font-medium text-green-800">
                          Koordinaten gespeichert
                        </Text>
                        <Text variant="small" className="text-green-700 mt-1">
                          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Grid>

          {/* Submit Button */}
          <div className="space-y-3">
            <button
              data-tutorial="analyze-button"
              onClick={handleSubmit}
              disabled={loading || (!imagePreview || !location)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analysiere...</span>
                </>
              ) : (
                <>
                  <SparklesIcon />
                  <span>Reiseeintrag erstellen</span>
                </>
              )}
            </button>
            
            {loading && (
              <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-progress-bar transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>

          {error && (
            <Card variant="outlined" padding="sm" className="bg-error-50 border-error-200">
              <Text variant="small" color="error">{error}</Text>
            </Card>
          )}
        </Stack>
      </Card>

      {result && (
        <Card variant="elevated" className="animate-fade-in" data-tutorial="analysis-result">
          <Stack spacing="lg">
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                data-tutorial="save-button"
                onClick={handleSave}
                disabled={isSaved}
                className="px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 disabled:bg-success-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSaved ? '✓ Gespeichert' : 'Eintrag speichern'}
              </button>
            </div>

            <Divider spacing="sm" />

            {/* Descriptions */}
            <div>
              <Heading level={4}>Kurzbeschreibung</Heading>
              <Text variant="body" color="secondary">{result.description_de}</Text>
            </div>

            <div>
              <Heading level={4}>Descripción (ES)</Heading>
              <Text variant="body" color="secondary" className="italic">{result.description_es}</Text>
            </div>

            <Divider spacing="sm" />

            {/* Vocabulary Table */}
            <div>
              <Heading level={4} className="mb-4">Vokabeln (ES → DE)</Heading>
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">
                        <Text variant="label" color="secondary" as="span">Spanisch</Text>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left">
                        <Text variant="label" color="secondary" as="span">Deutsch</Text>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {result.vocab.map((v, i) => (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Text variant="body" as="span" className="font-medium">{v.es}</Text>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Text variant="body" color="secondary" as="span">{v.de}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Divider spacing="sm" />

            {/* Quiz */}
            <div data-tutorial="analysis-quiz">
              <Heading level={4} className="mb-4">Quiz: Teste dein Wissen!</Heading>
              <Quiz quizData={result.quiz} />
            </div>

            <Divider spacing="sm" />

            {/* Tags */}
            <div>
              <Heading level={4} className="mb-3">Tags</Heading>
              <div className="flex flex-wrap gap-2">
                {result.labels.map((label, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-200 hover:bg-primary-100 transition-colors"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default ImageAnalyzer;