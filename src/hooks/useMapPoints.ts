import { useState, useCallback } from 'react';
import { MapPoint, CenterPoint, TravelMode, Algorithm } from '@/types/map';
import { calculateGeometricMedian, calculateMinimaxCenter, haversineDistance } from '@/lib/geometricMedian';
import { calculateRoutesToPoint } from '@/lib/routeCalculator';
import type { Friend } from '@/types/database';

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
    setCenterPoint(null);
  }, [points.length]);

  const addFriendAsPoint = useCallback((friend: Friend) => {
    const newPoint: MapPoint = {
      id: generateId(),
      lat: friend.location.lat,
      lng: friend.location.lng,
      label: friend.name,
      address: friend.location.address,
      friendId: friend.id,
    };
    setPoints((prev) => [...prev, newPoint]);
    setCenterPoint(null);
  }, []);

  const updatePoint = useCallback((id: string, lat: number, lng: number) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, lat, lng, address: undefined } : p))
    );
    setCenterPoint(null);
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, i) => ({
        ...p,
        label: p.friendId ? p.label : `Person ${i + 1}`,
      }));
    });
    setCenterPoint(null);
  }, []);

  const clearAll = useCallback(() => {
    setPoints([]);
    setCenterPoint(null);
  }, []);

  const calculateCenter = useCallback(async (travelMode?: TravelMode, algorithm: Algorithm = 'geometric_median') => {
    if (points.length < 2) return;

    setIsCalculating(true);

    try {
      const center = algorithm === 'minimax'
        ? calculateMinimaxCenter(points)
        : calculateGeometricMedian(points);

      if (travelMode) {
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
    addFriendAsPoint,
    updatePoint,
    removePoint,
    clearAll,
    calculateCenter,
  };
}
