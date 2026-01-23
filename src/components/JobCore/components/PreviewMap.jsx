import { useMemo } from 'react';
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Default UK center (London)
const DEFAULT_CENTER = { longitude: -0.1278, latitude: 51.5074 };
const DEFAULT_ZOOM = 15;

/**
 * Parse coordinate string to { latitude, longitude, zoom? } object
 * Supports formats: "lat,lon" (uses default zoom) or "lat,lon,zoom"
 */
function parseCoordinates(coordString) {
  if (!coordString || typeof coordString !== 'string') return null;

  const parts = coordString.split(',').map(s => s.trim());
  if (parts.length < 2 || parts.length > 3) return null;

  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  const zoom = parts.length === 3 ? parseFloat(parts[2]) : null;

  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  if (zoom !== null && (isNaN(zoom) || zoom < 0 || zoom > 22)) return null;

  return { latitude, longitude, zoom };
}

/**
 * PreviewMap - A read-only map displaying coordinates
 * Used in preview/overview tabs to show the location
 */
export default function PreviewMap({ value, height = 180 }) {
  const coordinates = useMemo(() => parseCoordinates(value), [value]);
  const center = coordinates || DEFAULT_CENTER;
  const zoom = coordinates?.zoom ?? DEFAULT_ZOOM;

  if (!coordinates) {
    return (
      <div
        className="rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        No coordinates set
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <Map
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        attributionControl={false}
      >
        <Marker
          longitude={center.longitude}
          latitude={center.latitude}
          anchor="bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-blue-600 drop-shadow-lg"
          >
            <path
              fillRule="evenodd"
              d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
        </Marker>
      </Map>
    </div>
  );
}
