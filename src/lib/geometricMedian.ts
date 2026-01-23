export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance between two points using Haversine formula
 */
export function haversineDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate the centroid of a set of points
 */
export function calculateCentroid(points: LatLng[]): LatLng {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

/**
 * Calculate the geometric median using Weiszfeld's algorithm
 * This minimizes the sum of distances to all points
 */
export function calculateGeometricMedian(
  points: LatLng[],
  maxIterations: number = 100,
  tolerance: number = 0.0001 // ~11 meters at equator
): LatLng {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (points.length === 1) {
    return { ...points[0] };
  }

  if (points.length === 2) {
    return {
      lat: (points[0].lat + points[1].lat) / 2,
      lng: (points[0].lng + points[1].lng) / 2,
    };
  }

  // Initialize with centroid
  let median = calculateCentroid(points);

  for (let i = 0; i < maxIterations; i++) {
    let numeratorLat = 0;
    let numeratorLng = 0;
    let denominator = 0;

    for (const point of points) {
      const distance = haversineDistance(median, point);
      
      // Avoid division by zero
      if (distance < 0.001) continue;

      const weight = 1 / distance;
      numeratorLat += point.lat * weight;
      numeratorLng += point.lng * weight;
      denominator += weight;
    }

    if (denominator === 0) {
      // All points are at the same location
      return { ...points[0] };
    }

    const newMedian = {
      lat: numeratorLat / denominator,
      lng: numeratorLng / denominator,
    };

    // Check for convergence
    const delta = Math.sqrt(
      Math.pow(newMedian.lat - median.lat, 2) + Math.pow(newMedian.lng - median.lng, 2)
    );

    median = newMedian;

    if (delta < tolerance) {
      break;
    }
  }

  return median;
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
