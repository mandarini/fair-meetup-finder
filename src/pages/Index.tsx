import { useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { ControlPanel } from '@/components/map/ControlPanel';
import { MapContainer } from '@/components/map/MapContainer';
import { useMapPoints } from '@/hooks/useMapPoints';
import { TravelMode } from '@/types/map';

const Index = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');

  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  const {
    points,
    centerPoint,
    isCalculating,
    addPoint,
    updatePoint,
    removePoint,
    clearAll,
    calculateCenter,
  } = useMapPoints();

  const handleMapClick = (lat: number, lng: number) => {
    addPoint(lat, lng);
    setIsAddingPoint(false);
  };

  const handleAddressSelect = (lat: number, lng: number, address: string) => {
    addPoint(lat, lng, address);
  };

  if (loadError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-destructive font-medium text-lg">Failed to load Google Maps</p>
          <p className="text-muted-foreground text-sm mt-2">Please check your API key in .env file</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading Google Maps...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Control Panel */}
      <div className="w-full max-w-sm border-r border-border flex flex-col shadow-lg z-10">
        <ControlPanel
          points={points}
          centerPoint={centerPoint}
          isAddingPoint={isAddingPoint}
          isCalculating={isCalculating}
          isGoogleLoaded={isLoaded}
          travelMode={travelMode}
          onToggleAddPoint={() => setIsAddingPoint(!isAddingPoint)}
          onAddressSelect={handleAddressSelect}
          onRemovePoint={removePoint}
          onClearAll={clearAll}
          onCalculate={() => calculateCenter(travelMode)}
          onTravelModeChange={setTravelMode}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          points={points}
          centerPoint={centerPoint}
          isAddingPoint={isAddingPoint}
          onMapClick={handleMapClick}
          onMarkerDrag={updatePoint}
        />

        {/* Adding Point Indicator */}
        {isAddingPoint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg text-sm font-medium animate-pulse">
            Click anywhere on the map to add a point
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
