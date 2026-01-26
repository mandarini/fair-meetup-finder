import { motion } from 'framer-motion';
import { CenterPoint } from '@/types/map';
import { formatDistance } from '@/lib/geometricMedian';
import { Navigation, MapPin } from 'lucide-react';

interface CenterResultsProps {
  centerPoint: CenterPoint;
}

export function CenterResults({ centerPoint }: CenterResultsProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-accent text-accent-foreground">
          <Navigation className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Meeting Point Found</h3>
          <p className="text-xs text-muted-foreground">
            {centerPoint.totalDuration ? 'Minimizes travel time' : 'Geometric median location'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">
            {centerPoint.lat.toFixed(6)}, {centerPoint.lng.toFixed(6)}
          </span>
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
    </motion.div>
  );
}
