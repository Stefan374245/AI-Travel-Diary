import React, { useState } from 'react';
import { TrashEntry } from '../../services/trashService';
import { Heading, Text, Stack, Card, Divider } from '../../design-system';
import { TrashIcon } from '../icons/TrashIcon';

interface TrashProps {
  trashEntries: TrashEntry[];
  onRestore: (entry: TrashEntry) => void;
  onPermanentDelete: (entryId: string) => void;
  onEmptyTrash: () => void;
}

const Trash: React.FC<TrashProps> = ({ trashEntries, onRestore, onPermanentDelete, onEmptyTrash }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  const handlePermanentDeleteClick = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(entryId);
  };

  const confirmPermanentDelete = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    onPermanentDelete(entryId);
    setConfirmDeleteId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleEmptyTrashClick = () => {
    setConfirmEmptyTrash(true);
  };

  const confirmEmpty = () => {
    onEmptyTrash();
    setConfirmEmptyTrash(false);
  };

  const cancelEmpty = () => {
    setConfirmEmptyTrash(false);
  };

  const getDaysInTrash = (deletedAt: string): number => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diff = now.getTime() - deleted.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (trashEntries.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <Stack spacing="md">
          <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
            <TrashIcon className="w-10 h-10 text-neutral-400" />
          </div>
          <Heading level={3}>Papierkorb ist leer</Heading>
          <Text color="muted">Gelöschte Einträge erscheinen hier und können wiederhergestellt werden.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack spacing="lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heading level={3}>Papierkorb</Heading>
          <span className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm font-semibold">
            {trashEntries.length} {trashEntries.length === 1 ? 'Eintrag' : 'Einträge'}
          </span>
        </div>
        
        <button
          onClick={handleEmptyTrashClick}
          className="px-4 py-2 text-sm font-semibold text-error-600 bg-error-50 hover:bg-error-100 rounded-lg transition-colors"
        >
          🗑️ Papierkorb leeren
        </button>
      </div>

      <div className="bg-info-50 border border-info-200 rounded-lg p-4">
        <Text variant="small" color="secondary">
          💡 <strong>Hinweis:</strong> Einträge im Papierkorb werden nach 30 Tagen automatisch gelöscht.
        </Text>
      </div>

      <Stack spacing="md">
        {trashEntries.map((entry) => {
          const daysInTrash = getDaysInTrash(entry.deletedAt);
          
          return (
            <Card key={entry.id} variant="default" padding="none" className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={entry.imagePreview} 
                    alt={entry.location} 
                    className="h-20 w-20 object-cover rounded-lg flex-shrink-0 shadow-sm opacity-60"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <Stack spacing="xs">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Heading level={4} className="mb-1 text-neutral-600">
                            {entry.location}
                          </Heading>
                          <div className="flex flex-wrap gap-2 text-sm text-neutral-500">
                            <span>Gelöscht: {new Date(entry.deletedAt).toLocaleDateString('de-DE')}</span>
                            <span>•</span>
                            <span className={daysInTrash > 20 ? 'text-error-600 font-semibold' : ''}>
                              {daysInTrash} {daysInTrash === 1 ? 'Tag' : 'Tage'} im Papierkorb
                            </span>
                            {daysInTrash > 20 && (
                              <>
                                <span>•</span>
                                <span className="text-error-600 font-semibold">
                                  Wird in {30 - daysInTrash} Tagen gelöscht
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Divider className="my-3" />

                      <div className="flex gap-2">
                        <button
                          onClick={() => onRestore(entry)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-success-700 bg-success-100 hover:bg-success-200 rounded-lg transition-colors"
                        >
                          ↩️ Wiederherstellen
                        </button>
                        <button
                          onClick={(e) => handlePermanentDeleteClick(e, entry.id)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-error-700 bg-error-100 hover:bg-error-200 rounded-lg transition-colors"
                        >
                          🗑️ Endgültig löschen
                        </button>
                      </div>
                    </Stack>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </Stack>

      {/* Permanent Delete Confirmation Overlay */}
      {confirmDeleteId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fade-in"
          onClick={cancelDelete}
        >
          <Card 
            variant="default" 
            padding="lg" 
            className="max-w-md mx-4 animate-scale-in"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Stack spacing="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
                  <TrashIcon className="w-6 h-6 text-error-600" />
                </div>
                <div className="flex-1">
                  <Heading level={4} className="mb-1">Endgültig löschen?</Heading>
                  <Text variant="small" color="muted">
                    Dieser Eintrag wird unwiderruflich gelöscht und kann nicht wiederhergestellt werden.
                  </Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={(e) => confirmPermanentDelete(e, confirmDeleteId)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Endgültig löschen
                </button>
              </div>
            </Stack>
          </Card>
        </div>
      )}

      {/* Empty Trash Confirmation Overlay */}
      {confirmEmptyTrash && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fade-in"
          onClick={cancelEmpty}
        >
          <Card 
            variant="default" 
            padding="lg" 
            className="max-w-md mx-4 animate-scale-in"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Stack spacing="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
                  <TrashIcon className="w-6 h-6 text-error-600" />
                </div>
                <div className="flex-1">
                  <Heading level={4} className="mb-1">Papierkorb leeren?</Heading>
                  <Text variant="small" color="muted">
                    Alle {trashEntries.length} Einträge werden unwiderruflich gelöscht.
                  </Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelEmpty}
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmEmpty}
                  className="px-4 py-2 text-sm font-semibold text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Papierkorb leeren
                </button>
              </div>
            </Stack>
          </Card>
        </div>
      )}
    </Stack>
  );
};

export default Trash;
