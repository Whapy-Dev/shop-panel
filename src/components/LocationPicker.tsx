import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { reverseGeocode, parseNominatimResult, type NominatimResult } from '@/services/nominatim';

// Fix Leaflet default marker icon for Vite bundler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];

export interface LocationPickerValue {
  address: string;
  latitude: number;
  longitude: number;
  province: string;
  city: string;
  postalCode: string;
}

interface LocationPickerProps {
  value?: Partial<LocationPickerValue>;
  onChange: (location: LocationPickerValue) => void;
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (lat !== prevRef.current.lat || lng !== prevRef.current.lng) {
      prevRef.current = { lat, lng };
      map.setView([lat, lng], 15);
    }
  }, [map, lat, lng]);

  return null;
}

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { query, setQuery, results, isSearching, clearResults } = useAddressSearch();
  const [showDropdown, setShowDropdown] = useState(false);

  const lat = Number(value?.latitude) || 0;
  const lng = Number(value?.longitude) || 0;
  const hasCoords = lat !== 0 || lng !== 0;
  const mapCenter: [number, number] = hasCoords ? [lat, lng] : DEFAULT_CENTER;

  const handleSelect = (result: NominatimResult) => {
    const parsed = parseNominatimResult(result);
    onChange(parsed);
    clearResults();
    setShowDropdown(false);
  };

  const handleMarkerDrag = async (newLat: number, newLng: number) => {
    try {
      const result = await reverseGeocode(newLat, newLng);
      const parsed = parseNominatimResult(result);
      onChange(parsed);
    } catch {
      onChange({
        address: value?.address || '',
        latitude: newLat,
        longitude: newLng,
        province: value?.province || '',
        city: value?.city || '',
        postalCode: value?.postalCode || '',
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar direccion..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="pl-9 pr-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}

        {/* Dropdown suggestions */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
              >
                <MapPin className="inline w-3 h-3 mr-2 text-muted-foreground" />
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current address display */}
      {value?.address && (
        <p className="text-sm text-foreground">
          <MapPin className="inline w-3.5 h-3.5 mr-1 text-primary" />
          {value.address}
        </p>
      )}

      {/* Map */}
      <div className="rounded-md overflow-hidden border" style={{ height: 300 }}>
        <MapContainer
          center={mapCenter}
          zoom={hasCoords ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater lat={mapCenter[0]} lng={mapCenter[1]} />
          {hasCoords && (
            <DraggableMarker position={[lat, lng]} onDragEnd={handleMarkerDrag} />
          )}
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {hasCoords && (
        <p className="text-xs text-muted-foreground">
          Lat: {lat.toFixed(4)} &nbsp; Lng: {lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}
