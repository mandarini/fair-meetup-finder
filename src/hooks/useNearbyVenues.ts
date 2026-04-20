import { useState, useCallback } from 'react';

export type VenueType = 'cafe' | 'restaurant' | 'bar';

export interface Venue {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  placeId: string;
  googleMapsUrl: string;
}

export function useNearbyVenues() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [venueType, setVenueType] = useState<VenueType>('cafe');

  const searchNearby = useCallback(
    (center: { lat: number; lng: number }, type: VenueType) => {
      setIsSearching(true);
      setVenue(null);
      setVenueType(type);

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(center.lat, center.lng),
        rankBy: google.maps.places.RankBy.DISTANCE,
        type,
      };

      service.nearbySearch(request, (results, status) => {
        setIsSearching(false);
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results.length > 0
        ) {
          const place = results[0];
          const loc = place.geometry?.location;
          if (loc) {
            setVenue({
              name: place.name || 'Unknown',
              address: place.vicinity || '',
              lat: loc.lat(),
              lng: loc.lng(),
              rating: place.rating,
              placeId: place.place_id || '',
              googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            });
          }
        }
      });
    },
    []
  );

  const clearVenue = useCallback(() => {
    setVenue(null);
  }, []);

  return {
    venue,
    venueType,
    isSearching,
    searchNearby,
    clearVenue,
  };
}
