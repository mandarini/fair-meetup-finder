import { useState, useCallback } from 'react';
import { MapPoint, CenterPoint, TravelMode } from '@/types/map';
import { calculateGeometricMedian, haversineDistance } from '@/lib/geometricMedian';
import { calculateRoutesToPoint } from '@/lib/routeCalculator';

export function useMapPoints() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [centerPoint, setCenterPoint] = useState<CenterPoint | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addPoint = useCallback((lat: number, lng: number, address?: string) => {
    const newPoint: MapPoint = {
      id: generateId(),
      lat,
      lng,
      label: `Person ${points.length + 1}`,
      address,
    };
    setPoints((prev) => [...prev, newPoint]);
    setCenterPoint(null); // Reset center when points change
  }, [points.length]);

  const updatePoint = useCallback((id: string, lat: number, lng: number) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, lat, lng, address: undefined } : p))
    );
    setCenterPoint(null);
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // Re-label remaining points
      return filtered.map((p, i) => ({ ...p, label: `Person ${i + 1}` }));
    });
    setCenterPoint(null);
  }, []);

  const clearAll = useCallback(() => {
    setPoints([]);
    setCenterPoint(null);
  }, []);

  const calculateCenter = useCallback(async (travelMode?: TravelMode) => {
    if (points.length < 2) return;

    setIsCalculating(true);

    try {
      // First, find geometric median as candidate center
      const center = calculateGeometricMedian(points);

      if (travelMode) {
        // Calculate actual routes using Google Directions API
        const routes = await calculateRoutesToPoint(
          points.map(p => ({ lat: p.lat, lng: p.lng })),
          { lat: center.lat, lng: center.lng },
          travelMode
        );

        const distances = points.map((point, index) => {
          const route = routes[index];
          return {
            pointId: point.id,
            distance: route?.distance || haversineDistance(center, point),
            duration: route?.duration,
          };
        });

        const totalDistance = distances.reduce((sum, d) => sum + d.distance, 0);
        const totalDuration = distances.reduce((sum, d) => sum + (d.duration || 0), 0);

        setCenterPoint({
          lat: center.lat,
          lng: center.lng,
          distances,
          totalDistance,
          totalDuration,
        });
      } else {
        // Fallback to straight-line distance
        const distances = points.map((point) => ({
          pointId: point.id,
          distance: haversineDistance(center, point),
        }));

        const totalDistance = distances.reduce((sum, d) => sum + d.distance, 0);

        setCenterPoint({
          lat: center.lat,
          lng: center.lng,
          distances,
          totalDistance,
        });
      }
    } catch (error) {
      console.error('Error calculating center:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [points]);

  return {
    points,
    centerPoint,
    isCalculating,
    addPoint,
    updatePoint,
    removePoint,
    clearAll,
    calculateCenter,
  };
}
