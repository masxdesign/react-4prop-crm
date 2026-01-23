import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
 * Format { latitude, longitude, zoom? } to coordinate string
 * Output: "lat,lon" or "lat,lon,zoom"
 */
function formatCoordinates(coords) {
  if (!coords) return '';
  const base = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
  if (coords.zoom != null) {
    return `${base},${Math.round(coords.zoom)}`;
  }
  return base;
}

/**
 * Format for display (more readable with spaces)
 */
function formatCoordinatesDisplay(coords) {
  if (!coords) return '';
  const base = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  if (coords.zoom != null) {
    return `${base} (z${Math.round(coords.zoom)})`;
  }
  return base;
}

/**
 * CoordinatePickerMap - A map with a centered marker for picking coordinates
 * The marker stays fixed in the center; panning the map changes the coordinates
 * Changes are only saved when the user clicks the Save button
 */
export default function CoordinatePickerMap({
  value,
  onChange,
  onSave,
  disabled = false,
  height = 200
}) {
  const mapRef = useRef(null);
  const isUserDragging = useRef(false);
  const isProgrammaticMove = useRef(false);
  // Initialize to null so first real value always triggers sync
  const lastExternalValue = useRef(null);

  // Track current map center (unsaved changes)
  const [currentCoords, setCurrentCoords] = useState(null);

  // Track if there are unsaved changes
  const hasUnsavedChanges = currentCoords !== null && currentCoords !== value;

  // Parse current value to coordinates (includes zoom if present)
  const coordinates = useMemo(() => parseCoordinates(value), [value]);
  const center = coordinates || DEFAULT_CENTER;
  const initialZoom = coordinates?.zoom ?? DEFAULT_ZOOM;

  // Sync map center and zoom when value changes externally (e.g., revision navigation)
  useEffect(() => {
    // Skip if user is currently dragging
    if (isUserDragging.current) return;

    // Skip if value hasn't changed from what we last set externally
    if (value === lastExternalValue.current) return;

    const map = mapRef.current?.getMap();
    if (!map || !coordinates) return;

    // Mark as programmatic move so we don't trigger save warning
    isProgrammaticMove.current = true;

    // Fly to new coordinates and zoom
    map.easeTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: coordinates.zoom ?? map.getZoom(),
      duration: 500
    });

    lastExternalValue.current = value;
    // Clear unsaved changes when external value changes
    setCurrentCoords(null);
  }, [value, coordinates]);

  // Handle map move end - track unsaved coordinates with zoom
  const handleMoveEnd = useCallback(() => {
    // Reset programmatic flag after any move ends
    if (isProgrammaticMove.current) {
      isProgrammaticMove.current = false;
      return;
    }

    if (disabled || !isUserDragging.current) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const mapCenter = map.getCenter();
    const zoom = map.getZoom();
    const formatted = formatCoordinates({
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      zoom
    });

    // Track unsaved changes locally
    setCurrentCoords(formatted);
    isUserDragging.current = false;
  }, [disabled]);

  // Handle save button click
  const handleSave = useCallback(() => {
    if (!currentCoords || disabled) return;

    // Update lastExternalValue so we don't trigger the sync effect
    lastExternalValue.current = currentCoords;

    onChange?.(currentCoords);
    onSave?.(currentCoords);
    setCurrentCoords(null);
  }, [currentCoords, disabled, onChange, onSave]);

  // Handle cancel - revert to saved value and zoom
  const handleCancel = useCallback(() => {
    setCurrentCoords(null);
    // Reset map to saved coordinates and zoom
    const map = mapRef.current?.getMap();
    if (map && coordinates) {
      // Mark as programmatic so we don't trigger save warning
      isProgrammaticMove.current = true;
      map.easeTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: coordinates.zoom ?? DEFAULT_ZOOM,
        duration: 300
      });
    }
  }, [coordinates]);

  // Track when user starts dragging (ignore programmatic moves)
  const handleMoveStart = useCallback(() => {
    if (isProgrammaticMove.current) return;
    isUserDragging.current = true;
  }, []);

  // Sync map position when map loads (handles case where value is set before map is ready)
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !coordinates) return;

    // If value differs from what the map was initialized with, sync it
    if (value !== lastExternalValue.current) {
      isProgrammaticMove.current = true;
      map.easeTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: coordinates.zoom ?? DEFAULT_ZOOM,
        duration: 0 // Instant on load
      });
      lastExternalValue.current = value;
    }
  }, [value, coordinates]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: initialZoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        dragPan={!disabled}
        scrollZoom={!disabled}
        doubleClickZoom={!disabled}
        touchZoomRotate={!disabled}
        onMoveStart={handleMoveStart}
        onMoveEnd={handleMoveEnd}
        onLoad={handleMapLoad}
        attributionControl={false}
      />

      {/* Fixed center marker - positioned absolutely over the map */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
        <div className="relative">
          <MapPin
            className="h-8 w-8 text-blue-600 drop-shadow-lg"
            fill="currentColor"
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Coordinate display overlay */}
      <div className="absolute bottom-2 left-2 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700 font-mono">
          {currentCoords
            ? formatCoordinatesDisplay(parseCoordinates(currentCoords))
            : (coordinates ? formatCoordinatesDisplay(coordinates) : 'No coordinates set')}
        </div>
      </div>

      {/* Prominent save/cancel bar when there are unsaved changes */}
      {hasUnsavedChanges && (
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-amber-500 text-white px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Location changed - save to update</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-7 px-2 text-white hover:bg-amber-600 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-7 px-3 bg-white text-amber-600 hover:bg-amber-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-100/50 z-[1001] cursor-not-allowed" />
      )}
    </div>
  );
}
