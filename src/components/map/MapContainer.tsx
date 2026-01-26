import { useRef, useState, useEffect } from 'react';
import { MapPoint, CenterPoint } from '@/types/map';

const mapStyles: google.maps.MapTypeStyle[] = [
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
];

interface MapContainerProps {
  points: MapPoint[];
  centerPoint: CenterPoint | null;
  isAddingPoint: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (pointId: string, lat: number, lng: number) => void;
}

export function MapContainer({
  points,
  centerPoint,
  isAddingPoint,
  onMapClick,
  onMarkerDrag,
}: MapContainerProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
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

  // Initialize map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: userLocation || { lat: 37.9838, lng: 23.7275 }, // Athens, Greece
      zoom: 12,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: mapStyles,
    });

    mapRef.current = map;

    // Add click listener
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (isAddingPoint && e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });
  }, [userLocation]);

  // Update click handler when isAddingPoint changes
  useEffect(() => {
    if (!mapRef.current) return;

    google.maps.event.clearListeners(mapRef.current, 'click');

    mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (isAddingPoint && e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });
  }, [isAddingPoint, onMapClick]);

  // Update markers when points change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Create new markers
    points.forEach((point, index) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapRef.current!,
        draggable: true,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#4a5568',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMarkerDrag(point.id, e.latLng.lat(), e.latLng.lng());
        }
      });

      markersRef.current.set(point.id, marker);
    });

    // Fit bounds
    if (points.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
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
  }, [points, centerPoint, onMarkerDrag]);

  // Update center marker and polylines
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
      centerMarkerRef.current = null;
    }

    // Clear old polylines
    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];

    if (!centerPoint) return;

    // Create center marker
    centerMarkerRef.current = new google.maps.Marker({
      position: { lat: centerPoint.lat, lng: centerPoint.lng },
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: '#e85d4c',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 4,
      },
      zIndex: 1000,
    });

    // Create polylines
    points.forEach(point => {
      const polyline = new google.maps.Polyline({
        path: [
          { lat: centerPoint.lat, lng: centerPoint.lng },
          { lat: point.lat, lng: point.lng },
        ],
        map: mapRef.current!,
        strokeColor: '#8fa4bf',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        geodesic: true,
      });
      polylinesRef.current.push(polyline);
    });
  }, [centerPoint, points]);

  // Update cursor when adding point
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setOptions({
      draggableCursor: isAddingPoint ? 'crosshair' : undefined,
    });
  }, [isAddingPoint]);

  return (
    <div
      ref={mapDivRef}
      style={{ width: '100%', height: '100%' }}
      className="relative"
    />
  );
}
