const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface ParsedLocation {
  address: string;
  latitude: number;
  longitude: number;
  province: string;
  city: string;
  postalCode: string;
}

export async function searchAddress(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'ar',
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'es' },
  });

  if (!res.ok) throw new Error('Error buscando direcciones');
  return res.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'Accept-Language': 'es' },
  });

  if (!res.ok) throw new Error('Error en geocoding inverso');
  return res.json();
}

export function parseNominatimResult(result: NominatimResult): ParsedLocation {
  const addr = result.address;
  const street = [addr.road, addr.house_number].filter(Boolean).join(' ');
  const locality = addr.suburb ? `${street}, ${addr.suburb}` : street;

  return {
    address: locality || result.display_name.split(',').slice(0, 3).join(','),
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    province: addr.state || '',
    city: addr.city || addr.town || addr.village || '',
    postalCode: addr.postcode || '',
  };
}
