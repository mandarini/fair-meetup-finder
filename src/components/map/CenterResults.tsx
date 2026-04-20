import { motion } from 'framer-motion';
import { CenterPoint } from '@/types/map';
import { formatDistance } from '@/lib/geometricMedian';
import { Navigation, MapPin, ExternalLink, Star, Coffee, UtensilsCrossed, Wine, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Venue, VenueType } from '@/hooks/useNearbyVenues';

interface CenterResultsProps {
  centerPoint: CenterPoint;
  venue?: Venue | null;
  venueType?: VenueType;
  isSearchingVenue?: boolean;
  onSearchVenue?: (type: VenueType) => void;
}

export function CenterResults({
  centerPoint,
  venue,
  venueType = 'cafe',
  isSearchingVenue = false,
  onSearchVenue,
}: CenterResultsProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const googleMapsCoordUrl = `https://www.google.com/maps/search/?api=1&query=${centerPoint.lat},${centerPoint.lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Meeting Point Result */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-accent text-accent-foreground">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground">Meeting Point Found</h3>
            <p className="text-xs text-muted-foreground">
              {centerPoint.totalDuration ? 'Minimizes travel time' : 'Geometric median location'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <a
              href={googleMapsCoordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              {centerPoint.lat.toFixed(6)}, {centerPoint.lng.toFixed(6)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="pt-2 border-t border-accent/20 space-y-2">
            {centerPoint.totalDuration !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total travel time</span>
                <span className="font-semibold text-accent">
                  {formatDuration(centerPoint.totalDuration)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total distance</span>
              <span className="font-semibold text-accent">
                {formatDistance(centerPoint.totalDistance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Search */}
      {onSearchVenue && (
        <div className="p-3 rounded-xl border border-border bg-card space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Find a place nearby</h4>
          <RadioGroup
            value={venueType}
            onValueChange={(v) => onSearchVenue(v as VenueType)}
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem value="cafe" id="venue-cafe" className="peer sr-only" />
              <Label
                htmlFor="venue-cafe"
                className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <Coffee className="h-4 w-4" />
                <span className="text-xs font-medium">Cafe</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="restaurant" id="venue-restaurant" className="peer sr-only" />
              <Label
                htmlFor="venue-restaurant"
                className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span className="text-xs font-medium">Restaurant</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="bar" id="venue-bar" className="peer sr-only" />
              <Label
                htmlFor="venue-bar"
                className="flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <Wine className="h-4 w-4" />
                <span className="text-xs font-medium">Bar</span>
              </Label>
            </div>
          </RadioGroup>

          {isSearchingVenue && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {venue && !isSearchingVenue && (
            <div className="p-3 rounded-lg bg-secondary/50 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{venue.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{venue.address}</p>
                </div>
                {venue.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                    <Star className="h-3 w-3 fill-current" />
                    {venue.rating}
                  </div>
                )}
              </div>
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
