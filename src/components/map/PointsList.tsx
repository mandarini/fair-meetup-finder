import { motion, AnimatePresence } from 'framer-motion';
import { MapPoint, CenterPoint } from '@/types/map';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { formatDistance } from '@/lib/geometricMedian';

interface PointsListProps {
  points: MapPoint[];
  centerPoint: CenterPoint | null;
  onRemovePoint: (id: string) => void;
}

export function PointsList({ points, centerPoint, onRemovePoint }: PointsListProps) {
  const getDistanceForPoint = (pointId: string): number | undefined => {
    return centerPoint?.distances.find((d) => d.pointId === pointId)?.distance;
  };

  if (points.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No points added yet</p>
        <p className="text-xs mt-1">Click the map or search for an address</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {points.map((point, index) => {
          const distance = getDistanceForPoint(point.id);
          
          return (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-accent/30 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {point.label}
                </p>
                {point.address && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {point.address}
                  </p>
                )}
                {!point.address && (
                  <p className="text-xs text-muted-foreground">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {distance !== undefined && (
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-accent">
                    {formatDistance(distance)}
                  </span>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemovePoint(point.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
