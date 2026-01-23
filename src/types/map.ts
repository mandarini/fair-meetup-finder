export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  address?: string;
}

export interface CenterPoint {
  lat: number;
  lng: number;
  distances: { pointId: string; distance: number }[];
  totalDistance: number;
}
