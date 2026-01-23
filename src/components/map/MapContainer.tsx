import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { MapPoint, CenterPoint } from '@/types/map';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ saturation: -20 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e0e8f0' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ lightness: 50 }],
    },
  ],
};

interface MapContainerProps {
  points: MapPoint[];
  centerPoint: CenterPoint | null;
  isAddingPoint: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (pointId: string, lat: number, lng: number) => void;
  apiKey: string;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export function MapContainer({
  points,
  centerPoint,
  isAddingPoint,
  onMapClick,
  onMarkerDrag,
  apiKey,
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Permission denied or error, use default
        }
      );
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (isAddingPoint && e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    },
    [isAddingPoint, onMapClick]
  );

  const handleMarkerDragEnd = useCallback(
    (pointId: string, e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMarkerDrag(pointId, e.latLng.lat(), e.latLng.lng());
      }
    },
    [onMarkerDrag]
  );

  // Fit bounds when points change
  useEffect(() => {
    if (mapRef.current && points.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach((point) => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });
      if (centerPoint) {
        bounds.extend({ lat: centerPoint.lat, lng: centerPoint.lng });
      }
      mapRef.current.fitBounds(bounds, 80);
      
      // Don't zoom in too much for single point
      const listener = google.maps.event.addListener(mapRef.current, 'idle', () => {
        if (mapRef.current && mapRef.current.getZoom()! > 15) {
          mapRef.current.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [points, centerPoint]);

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary">
        <div className="text-center p-8">
          <p className="text-destructive font-medium">Failed to load Google Maps</p>
          <p className="text-muted-foreground text-sm mt-2">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={userLocation || defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onClick={handleMapClick}
      options={{
        ...mapOptions,
        draggableCursor: isAddingPoint ? 'crosshair' : 'grab',
      }}
    >
      {/* Participant markers */}
      {points.map((point, index) => (
        <Marker
          key={point.id}
          position={{ lat: point.lat, lng: point.lng }}
          draggable
          onDragEnd={(e) => handleMarkerDragEnd(point.id, e)}
          label={{
            text: String(index + 1),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#4a5568',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          }}
        />
      ))}

      {/* Center point marker */}
      {centerPoint && (
        <Marker
          position={{ lat: centerPoint.lat, lng: centerPoint.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: '#e85d4c',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 4,
          }}
          zIndex={1000}
        />
      )}

      {/* Lines from center to each point */}
      {centerPoint &&
        points.map((point) => (
          <Polyline
            key={`line-${point.id}`}
            path={[
              { lat: centerPoint.lat, lng: centerPoint.lng },
              { lat: point.lat, lng: point.lng },
            ]}
            options={{
              strokeColor: '#8fa4bf',
              strokeOpacity: 0.7,
              strokeWeight: 2,
              geodesic: true,
            }}
          />
        ))}
    </GoogleMap>
  );
}
