import { useState, useCallback } from 'react';
import { MapPoint, CenterPoint } from '@/types/map';
import { calculateMinimaxCenter, haversineDistance } from '@/lib/geometricMedian';

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

  const calculateCenter = useCallback(() => {
    if (points.length < 2) return;

    setIsCalculating(true);

    // Simulate async for UX
    setTimeout(() => {
      const center = calculateMinimaxCenter(points);

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

      setIsCalculating(false);
    }, 300);
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
