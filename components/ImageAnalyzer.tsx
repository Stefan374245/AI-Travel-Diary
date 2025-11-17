import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';
import { ImageAnalysisResult, SavedEntry } from '../types';
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
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const toast = useToast();

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
      };
      onSaveEntry(entryData);
      setIsSaved(true);
      toast.success('Reiseeintrag wurde gespeichert! 🎉');
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
    if (!imageFile || !location) {
      toast.warning('Bitte wähle ein Bild aus und gib einen Ort an.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const imageData = await fileToGenerativePart(imageFile);
      const analysisResult = await analyzeImage(imageData.inlineData.data, imageData.inlineData.mimeType, location);
      setResult(analysisResult);
      toast.success('Bildanalyse erfolgreich abgeschlossen! ✨');
    } catch (err) {
      console.error(err);
      const errorMsg = 'Fehler bei der Analyse des Bildes. Bitte versuche es erneut.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [imageFile, location, toast]);

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
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-lg hover:border-primary-400 transition-colors duration-200">
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

            {/* Location Input */}
            <div>
              <Text variant="label" as="label" htmlFor="location" className="block mb-2">
                Ort
              </Text>
              <input
                type="text"
                name="location"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-base border-neutral-300 rounded-lg px-4 py-3 transition-colors duration-200"
                placeholder="z.B. Barcelona, Spanien"
              />
              <Text variant="small" color="muted" className="mt-2">
                Wo wurde das Foto aufgenommen?
              </Text>
            </div>
          </Grid>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !imageFile || !location}
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

          {error && (
            <Card variant="outlined" padding="sm" className="bg-error-50 border-error-200">
              <Text variant="small" color="error">{error}</Text>
            </Card>
          )}
        </Stack>
      </Card>

      {result && (
        <Card variant="elevated" className="animate-fade-in">
          <Stack spacing="lg">
            {/* Save Button */}
            <div className="flex justify-end">
              <button
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
            <div>
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