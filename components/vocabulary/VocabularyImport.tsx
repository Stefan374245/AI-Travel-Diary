import React, { useState, useEffect } from 'react';
import { VocabularyEntry } from '../../types';
import { 
  loadVocabulary, 
  getVocabularyCategories, 
  importVocabAsFlashcard,
  importCategoryAsFlashcards,
  PREDEFINED_VOCAB_LISTS,
  importVocabulary,
  deleteVocabulary
} from '../../services/vocabularyService';
import { Card, Stack, Heading, Text, Grid } from '../../design-system';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { useToast } from '../../contexts/ToastContext';

const VocabularyImport: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const vocab = await loadVocabulary();
    const cats = await getVocabularyCategories();
    setVocabulary(vocab);
    setCategories(cats);
  };

  const handleImportPredefined = async (categoryName: string) => {
    setLoading(true);
    try {
      const vocabList = PREDEFINED_VOCAB_LISTS[categoryName as keyof typeof PREDEFINED_VOCAB_LISTS];
      await importVocabulary(vocabList, categoryName);
      await loadData();
      showToast(`${vocabList.length} Vokabeln importiert`, 'success');
    } catch (error) {
      showToast('Fehler beim Importieren', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportAsFlashcard = async (vocabId: string) => {
    const success = await importVocabAsFlashcard(vocabId);
    if (success) {
      showToast('Als Lernkarte gespeichert', 'success');
      await loadData();
    } else {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const handleImportCategory = async (category: string) => {
    setLoading(true);
    try {
      const result = await importCategoryAsFlashcards(category);
      showToast(`${result.success} Lernkarten erstellt`, 'success');
      await loadData();
    } catch (error) {
      showToast('Fehler beim Importieren', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vocabId: string) => {
    try {
      await deleteVocabulary(vocabId);
      showToast('Vokabel gelöscht', 'success');
      await loadData();
    } catch (error) {
      showToast('Fehler beim Löschen', 'error');
    }
  };

  const filteredVocabulary = vocabulary.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      v.es.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.de.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const predefinedCategories = Object.keys(PREDEFINED_VOCAB_LISTS);
  const notImportedCategories = predefinedCategories.filter(cat => !categories.includes(cat));

  return (
    <div className="space-y-6">
      {/* Vordefinierte Listen importieren */}
      {notImportedCategories.length > 0 && (
        <Card variant="default" padding="md">
          <Stack spacing="md">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-primary-600" />
              <Heading level={4}>Vokabellisten importieren</Heading>
            </div>
            <Text variant="small" color="muted">
              Importiere vordefinierte Vokabellisten in deine Bibliothek
            </Text>
            <Grid cols={3} gap="sm">
              {notImportedCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleImportPredefined(category)}
                  disabled={loading}
                  className="px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  📚 {category}
                  <div className="text-xs text-primary-600 mt-1">
                    {PREDEFINED_VOCAB_LISTS[category as keyof typeof PREDEFINED_VOCAB_LISTS].length} Vokabeln
                  </div>
                </button>
              ))}
            </Grid>
          </Stack>
        </Card>
      )}

      {/* Vokabel-Bibliothek */}
      <Card variant="default" padding="md">
        <Stack spacing="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-primary-600" />
              <Heading level={4}>Vokabel-Bibliothek</Heading>
              <span className="text-sm text-neutral-500">({vocabulary.length} Vokabeln)</span>
            </div>
          </div>

          {/* Filter & Suche */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Vokabeln durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Kategorie filtern"
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Kategorie-Actions */}
          {selectedCategory !== 'all' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleImportCategory(selectedCategory)}
                disabled={loading}
                className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                ✅ Alle als Lernkarten importieren
              </button>
            </div>
          )}

          {/* Vokabel-Liste */}
          {filteredVocabulary.length === 0 ? (
            <div className="text-center py-12">
              <Text variant="body" color="muted">
                {vocabulary.length === 0 
                  ? 'Noch keine Vokabeln importiert. Starte mit einer vordefinierten Liste!'
                  : 'Keine Vokabeln gefunden'
                }
              </Text>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVocabulary.map(vocab => (
                <div
                  key={vocab.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Text variant="body" className="font-semibold text-neutral-900">
                        {vocab.es}
                      </Text>
                      <Text variant="body" color="muted">
                        →
                      </Text>
                      <Text variant="body" color="muted">
                        {vocab.de}
                      </Text>
                    </div>
                    <Text variant="small" color="muted" className="mt-1">
                      {vocab.category}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    {vocab.saved ? (
                      <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
                        ✓ Gespeichert
                      </span>
                    ) : (
                      <button
                        onClick={() => handleImportAsFlashcard(vocab.id)}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-semibold"
                      >
                        + Als Lernkarte
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(vocab.id)}
                      className="p-2 text-neutral-400 hover:text-error-600 transition-colors"
                      aria-label="Löschen"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Stack>
      </Card>

      {/* Statistik */}
      {categories.length > 0 && (
        <Card variant="ghost" padding="md">
          <Stack spacing="sm">
            <Text variant="label" color="secondary">Kategorien-Übersicht</Text>
            <Grid cols={3} gap="sm">
              {categories.map(cat => {
                const count = vocabulary.filter(v => v.category === cat).length;
                const saved = vocabulary.filter(v => v.category === cat && v.saved).length;
                return (
                  <div key={cat} className="p-3 bg-white rounded-lg border border-neutral-200">
                    <Text variant="small" className="font-semibold">{cat}</Text>
                    <Text variant="meta" color="muted">
                      {count} Vokabeln • {saved} gespeichert
                    </Text>
                  </div>
                );
              })}
            </Grid>
          </Stack>
        </Card>
      )}
    </div>
  );
};

export default VocabularyImport;
