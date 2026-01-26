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
 * Calculate the minimax center (1-center problem)
 * This minimizes the maximum distance anyone has to travel
 * This is the "fairest" algorithm - finds center of smallest enclosing circle
 */
export function calculateMinimaxCenter(
  points: LatLng[],
  maxIterations: number = 1000,
  tolerance: number = 0.00001 // ~1 meter
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

  // Start with centroid
  let center = calculateCentroid(points);
  const stepSize = 0.5; // Adjust step size for convergence

  for (let iter = 0; iter < maxIterations; iter++) {
    // Find the farthest point from current center
    let maxDist = 0;
    let farthestPoint: LatLng | null = null;

    for (const point of points) {
      const dist = haversineDistance(center, point);
      if (dist > maxDist) {
        maxDist = dist;
        farthestPoint = point;
      }
    }

    if (!farthestPoint || maxDist < tolerance) {
      break;
    }

    // Move center toward the farthest point to balance distances
    // Use adaptive step size that decreases over iterations
    const adaptiveStep = stepSize / Math.sqrt(iter + 1);
    const moveFraction = adaptiveStep * 0.1; // Small movements

    const newCenter = {
      lat: center.lat + (farthestPoint.lat - center.lat) * moveFraction,
      lng: center.lng + (farthestPoint.lng - center.lng) * moveFraction,
    };

    // Check if this actually improves the maximum distance
    let newMaxDist = 0;
    for (const point of points) {
      const dist = haversineDistance(newCenter, point);
      if (dist > newMaxDist) {
        newMaxDist = dist;
      }
    }

    // Only accept the move if it reduces the maximum distance
    if (newMaxDist < maxDist - tolerance) {
      center = newCenter;
    } else {
      // If we can't improve, we've converged
      break;
    }
  }

  return center;
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
