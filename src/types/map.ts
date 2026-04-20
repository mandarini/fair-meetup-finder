export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  address?: string;
  friendId?: string;
}

export interface CenterPoint {
  lat: number;
  lng: number;
  distances: Array<{
    pointId: string;
    distance: number;
    duration?: number; // Travel time in seconds
  }>;
  totalDistance: number;
  totalDuration?: number; // Total travel time in seconds
}

export type TravelMode = 'DRIVING' | 'WALKING' | 'TRANSIT';

export type Algorithm = 'geometric_median' | 'minimax';
