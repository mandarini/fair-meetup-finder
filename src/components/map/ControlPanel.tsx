import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from './AddressAutocomplete';
import { PointsList } from './PointsList';
import { CenterResults } from './CenterResults';
import { MapPoint, CenterPoint, TravelMode } from '@/types/map';
import { MousePointer2, Target, Trash2, MapPin, Car, PersonStanding, Train } from 'lucide-react';

interface ControlPanelProps {
  points: MapPoint[];
  centerPoint: CenterPoint | null;
  isAddingPoint: boolean;
  isCalculating: boolean;
  isGoogleLoaded: boolean;
  travelMode: TravelMode;
  onToggleAddPoint: () => void;
  onAddressSelect: (lat: number, lng: number, address: string) => void;
  onRemovePoint: (id: string) => void;
  onClearAll: () => void;
  onCalculate: () => void;
  onTravelModeChange: (mode: TravelMode) => void;
}

export function ControlPanel({
  points,
  centerPoint,
  isAddingPoint,
  isCalculating,
  isGoogleLoaded,
  travelMode,
  onToggleAddPoint,
  onAddressSelect,
  onRemovePoint,
  onClearAll,
  onCalculate,
  onTravelModeChange,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-accent/10">
            <MapPin className="h-5 w-5 text-accent" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            MeetPoint
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Find the fair meeting location for everyone
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-border space-y-4">
        <AddressAutocomplete
          onPlaceSelect={onAddressSelect}
          isLoaded={isGoogleLoaded}
        />

        <div className="flex gap-2">
          <Button
            variant={isAddingPoint ? "default" : "outline"}
            className={`flex-1 transition-all ${
              isAddingPoint 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-secondary'
            }`}
            onClick={onToggleAddPoint}
          >
            <MousePointer2 className="h-4 w-4 mr-2" />
            {isAddingPoint ? 'Click Map...' : 'Add Point'}
          </Button>

          {points.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:border-destructive/30"
              onClick={onClearAll}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Points List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Participants
          </h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {points.length} point{points.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <PointsList
          points={points}
          centerPoint={centerPoint}
          onRemovePoint={onRemovePoint}
        />
      </div>

      {/* Results & Calculate */}
      <div className="p-4 border-t border-border space-y-4">
        {centerPoint && <CenterResults centerPoint={centerPoint} />}

        {/* Travel Mode Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Travel Mode</Label>
          <RadioGroup
            value={travelMode}
            onValueChange={(value) => onTravelModeChange(value as TravelMode)}
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem value="WALKING" id="walking" className="peer sr-only" />
              <Label
                htmlFor="walking"
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <PersonStanding className="h-5 w-5" />
                <span className="text-xs font-medium">Walk</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="TRANSIT" id="transit" className="peer sr-only" />
              <Label
                htmlFor="transit"
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <Train className="h-5 w-5" />
                <span className="text-xs font-medium">Transit</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="DRIVING" id="driving" className="peer sr-only" />
              <Label
                htmlFor="driving"
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
              >
                <Car className="h-5 w-5" />
                <span className="text-xs font-medium">Drive</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-accent-glow transition-all disabled:opacity-50 disabled:shadow-none"
          disabled={points.length < 2 || isCalculating}
          onClick={onCalculate}
        >
          <Target className="h-4 w-4 mr-2" />
          {isCalculating ? 'Calculating...' : 'Find Meeting Point'}
        </Button>

        {points.length < 2 && (
          <p className="text-xs text-center text-muted-foreground">
            Add at least 2 points to calculate
          </p>
        )}
      </div>
    </div>
  );
}
