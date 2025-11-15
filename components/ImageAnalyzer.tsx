import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';
import { ImageAnalysisResult, SavedEntry } from '../types';
import Quiz from './Quiz';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

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
      setError('Bitte wähle ein Bild aus und gib einen Ort an.');
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
    } catch (err) {
      console.error(err);
      setError('Fehler bei der Analyse des Bildes. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, [imageFile, location]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Lade dein Reisefoto hoch</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">Foto</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
                ) : (
                  <UploadIcon />
                )}
                <div className="flex text-sm text-slate-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Lade eine Datei hoch</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">oder ziehe sie hierher</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF bis zu 10MB</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">Ort (z.B. Barcelona, Spanien)</label>
            <input
              type="text"
              name="location"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
              placeholder="Wo wurde das Foto aufgenommen?"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !imageFile || !location}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
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
        </div>
        {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-8 animate-fade-in">
          <div className="flex justify-end">
             <button
              onClick={handleSave}
              disabled={isSaved}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaved ? 'Gespeichert' : 'Eintrag speichern'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Kurzbeschreibung (DE)</h3>
            <p className="text-slate-600">{result.description_de}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Descripción (ES)</h3>
            <p className="text-slate-600 italic">{result.description_es}</p>
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
                        {result.vocab.map((v, i) => (
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
            <Quiz quizData={result.quiz} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {result.labels.map((label, i) => (
                <span key={i} className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">{label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;