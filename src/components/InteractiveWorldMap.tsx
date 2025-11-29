import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MOCK_ORGANIZATIONS } from '@/data/mock-organizations';
import { MOCK_COMPANIES } from '@/data/mock-companies';
import { MOCK_ASSOCIATIONS } from '@/data/mock-associations';
import { Building2, Globe, Users } from 'lucide-react';

// Coordonnées approximatives des villes
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Europe
  'Paris': [2.3522, 48.8566],
  'Berlin': [13.4050, 52.5200],
  'Bruxelles': [4.3517, 50.8503],
  'Madrid': [3.7038, 40.4168],
  'Lisbonne': [9.1393, 38.7223],
  'Rome': [12.4964, 41.9028],
  'Londres': [0.1278, 51.5074],
  'Genève': [6.1432, 46.2044],
  'Monaco': [7.4246, 43.7384],
  'Moscou': [37.6173, 55.7558],
  
  // Afrique
  'Libreville': [9.4673, 0.4162],
  'Pretoria': [28.2293, 25.7479],
  'Alger': [3.0588, 36.7538],
  'Luanda': [13.2343, 8.8383],
  'Cotonou': [2.3158, 6.3703],
  'Yaoundé': [11.5174, 3.8480],
  'Brazzaville': [15.2832, 4.2634],
  'Abidjan': [4.0083, 5.3599],
  'Le Caire': [31.2357, 30.0444],
  'Addis-Abeba': [38.7469, 9.0320],
  'Accra': [0.1870, 5.6037],
  'Malabo': [8.7832, 3.7504],
  'Bata': [9.7670, 1.8637],
  'Bamako': [8.0000, 12.6392],
  'Rabat': [6.8498, 34.0209],
  'Laâyoune': [13.2023, 27.1251],
  'Abuja': [7.5248, 9.0765],
  'Kinshasa': [15.3222, 4.4419],
  'Kigali': [30.0619, 1.9403],
  'São Tomé': [6.7273, 0.3365],
  'Dakar': [17.4677, 14.7167],
  'Lomé': [1.2123, 6.1256],
  'Tunis': [10.1815, 36.8065],
  
  // Amériques
  'Washington': [77.0369, 38.9072],
  'New York': [74.0060, 40.7128],
  'Ottawa': [75.6972, 45.4215],
  'Brasília': [47.9292, 15.8267],
  'Buenos Aires': [58.3816, 34.6037],
  'Mexico': [99.1332, 19.4326],
  
  // Asie
  'Pékin': [116.4074, 39.9042],
  'Tokyo': [139.6917, 35.6762],
  'New Delhi': [77.2090, 28.6139],
  'Riyad': [46.6753, 24.7136],
  'Ankara': [32.8597, 39.9334],
  'Téhéran': [51.3890, 35.6892],
  'Doha': [51.5310, 25.2854],
  'Abou Dhabi': [54.3773, 24.4539],
  
  // Villes françaises
  'Lyon': [4.8357, 45.7640],
  'Bordeaux': [0.5792, 44.8378],
  'Marseille': [5.3698, 43.2965],
};

interface MapMarker {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'organization' | 'company' | 'association';
  city: string;
  country: string;
}

export function InteractiveWorldMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    // Préparer les markers
    const allMarkers: MapMarker[] = [];

    // Organisations diplomatiques
    MOCK_ORGANIZATIONS.forEach(org => {
      const city = org.metadata?.city || org.city || '';
      const coordinates = CITY_COORDINATES[city];
      if (coordinates) {
        allMarkers.push({
          id: org.id,
          name: org.name,
          coordinates,
          type: 'organization',
          city,
          country: org.metadata?.country || org.country || ''
        });
      }
    });

    // Entreprises
    MOCK_COMPANIES.forEach(company => {
      const city = company.address.city || '';
      const coordinates = CITY_COORDINATES[city];
      if (coordinates) {
        allMarkers.push({
          id: company.id,
          name: company.name,
          coordinates,
          type: 'company',
          city,
          country: company.address.country || ''
        });
      }
    });

    // Associations
    MOCK_ASSOCIATIONS.forEach(association => {
      const city = association.address.city || '';
      const coordinates = CITY_COORDINATES[city];
      if (coordinates) {
        allMarkers.push({
          id: association.id,
          name: association.name,
          coordinates,
          type: 'association',
          city,
          country: association.address.country || ''
        });
      }
    });

    setMarkers(allMarkers);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialiser la carte
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [9.4673, 0.4162], // Centré sur le Gabon
      zoom: 2,
      pitch: 0,
      projection: 'globe' as any
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Ajouter les marqueurs
    markers.forEach(marker => {
      if (!map.current) return;

      // Créer un élément HTML pour le marqueur
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      
      // Couleur selon le type
      let bgColor = '';
      let icon = '';
      switch (marker.type) {
        case 'organization':
          bgColor = 'hsl(var(--primary))';
          icon = '🏛️';
          break;
        case 'company':
          bgColor = 'hsl(var(--secondary))';
          icon = '🏢';
          break;
        case 'association':
          bgColor = 'hsl(var(--accent))';
          icon = '👥';
          break;
      }

      el.style.backgroundColor = bgColor;
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '18px';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      el.style.border = '2px solid white';
      el.textContent = icon;

      // Créer le popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; font-family: Inter, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: hsl(var(--foreground));">${marker.name}</h3>
          <p style="margin: 0; font-size: 12px; color: hsl(var(--muted-foreground));">${marker.city}, ${marker.country}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: hsl(var(--${marker.type === 'organization' ? 'primary' : marker.type === 'company' ? 'secondary' : 'accent'}));">
            ${marker.type === 'organization' ? '🏛️ Organisation' : marker.type === 'company' ? '🏢 Entreprise' : '👥 Association'}
          </p>
        </div>
      `);

      // Ajouter le marqueur à la carte
      new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .setPopup(popup)
        .addTo(map.current);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [markers]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur p-4 rounded-lg shadow-lg border border-border">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Légende</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'hsl(var(--primary))' }}>
              🏛️
            </div>
            <span className="text-xs text-foreground">Organisations diplomatiques</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
              🏢
            </div>
            <span className="text-xs text-foreground">Entreprises</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'hsl(var(--accent))' }}>
              👥
            </div>
            <span className="text-xs text-foreground">Associations</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur p-4 rounded-lg shadow-lg border border-border">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Réseau mondial</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground">
              <strong>{markers.filter(m => m.type === 'organization').length}</strong> missions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-secondary" />
            <span className="text-xs text-foreground">
              <strong>{markers.filter(m => m.type === 'company').length}</strong> entreprises
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-foreground">
              <strong>{markers.filter(m => m.type === 'association').length}</strong> associations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
