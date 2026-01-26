import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  isLoaded: boolean;
}

export function AddressAutocomplete({ onPlaceSelect, isLoaded }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        onPlaceSelect(
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          place.formatted_address || place.name || ''
        );
        setInputValue('');
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onPlaceSelect]);

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          disabled
          placeholder="Loading..."
          className="pl-10"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for an address..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 bg-card border-border focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      />
    </div>
  );
}
