import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SavedEntry } from '../../types';
import { Heading, Text, Stack, Card } from '../../design-system';

// Fix für Leaflet Icons in Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TravelMapProps {
  entries: SavedEntry[];
  onMarkerClick?: (entry: SavedEntry) => void;
}

const TravelMap: React.FC<TravelMapProps> = ({ entries, onMarkerClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialisiere Karte
    const map = L.map(mapContainerRef.current).setView([51.1657, 10.4515], 6); // Deutschland Zentrum

    // OpenStreetMap Tiles hinzufügen
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Entferne alle alten Marker komplett
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Filter Einträge mit Koordinaten
    const entriesWithCoords = entries.filter(entry => entry.coordinates);

    if (entriesWithCoords.length === 0) return;

    // Füge Marker für jeden Eintrag hinzu
    const newMarkers: L.Marker[] = [];
    
    entriesWithCoords.forEach((entry) => {
      if (!entry.coordinates) return;

      const marker = L.marker([entry.coordinates.lat, entry.coordinates.lng])
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <img 
              src="${entry.imagePreview}" 
              alt="${entry.location}" 
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
            />
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${entry.location}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${new Date(entry.timestamp).toLocaleDateString('de-DE', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            ${entry.coordinates ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">${entry.coordinates.lat.toFixed(4)}, ${entry.coordinates.lng.toFixed(4)}</p>` : ''}
          </div>
        `);

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(entry);
        }
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Zoom auf alle Marker - nur wenn sich die Anzahl geändert hat oder neue Koordinaten
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds().pad(0.1), { 
        maxZoom: 15,
        animate: true,
        duration: 0.5 
      });
    }

  }, [entries, onMarkerClick]);

  const entriesWithCoords = entries.filter(e => e.coordinates);
  const entriesWithoutCoords = entries.filter(e => !e.coordinates);

  return (
    <Stack spacing="lg">
      {entriesWithoutCoords.length > 0 && (
        <Card variant="outlined" padding="md" className="bg-warning-50 border-warning-200">
          <Text variant="small" className="text-warning-800">
            ⚠️ <strong>{entriesWithoutCoords.length}</strong> {entriesWithoutCoords.length === 1 ? 'Eintrag hat' : 'Einträge haben'} keine GPS-Koordinaten und werden nicht auf der Karte angezeigt.
          </Text>
        </Card>
      )}

      <Card variant="default" padding="none" className="overflow-hidden">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[600px]"
          style={{ zIndex: 0 }}
        />
      </Card>

      {entriesWithCoords.length === 0 && (
        <Card variant="ghost" padding="xl" className="text-center">
          <Stack spacing="sm">
            <div className="text-6xl">🗺️</div>
            <Heading level={3}>Keine Standorte verfügbar</Heading>
            <Text color="muted">
              Füge GPS-Koordinaten zu deinen Einträgen hinzu, um sie auf der Karte zu sehen!
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default TravelMap;
