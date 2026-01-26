import { TravelMode } from '@/types/map';

export interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
}

/**
 * Calculate route between two points using Google Maps DirectionsService
 */
export async function calculateRoute(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  travelMode: TravelMode
): Promise<RouteResult | null> {
  const directionsService = new google.maps.DirectionsService();

  try {
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode[travelMode],
      // For transit, set departure time to now
      ...(travelMode === 'TRANSIT' && { transitOptions: { departureTime: new Date() } }),
    });

    if (result.routes && result.routes.length > 0) {
      const route = result.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance?.value || 0,
        duration: leg.duration?.value || 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

/**
 * Calculate routes from all origin points to a single destination
 */
export async function calculateRoutesToPoint(
  origins: google.maps.LatLngLiteral[],
  destination: google.maps.LatLngLiteral,
  travelMode: TravelMode
): Promise<Array<RouteResult | null>> {
  // Calculate all routes in parallel
  const promises = origins.map(origin =>
    calculateRoute(origin, destination, travelMode)
  );

  return Promise.all(promises);
}

/**
 * Find the fairest meeting point by testing multiple candidates
 * using actual route calculations
 */
export async function findFairestMeetingPoint(
  points: google.maps.LatLngLiteral[],
  travelMode: TravelMode,
  candidateCenter: google.maps.LatLngLiteral
): Promise<{
  center: google.maps.LatLngLiteral;
  routes: Array<RouteResult | null>;
  maxDuration: number;
}> {
  // Calculate routes from all points to the candidate center
  const routes = await calculateRoutesToPoint(points, candidateCenter, travelMode);

  // Find maximum duration
  const maxDuration = Math.max(
    ...routes.map(r => r?.duration || 0)
  );

  return {
    center: candidateCenter,
    routes,
    maxDuration,
  };
}
