import { useState } from 'react';
import { ControlPanel } from '@/components/map/ControlPanel';
import { MapContainer } from '@/components/map/MapContainer';
import { useMapPoints } from '@/hooks/useMapPoints';

const Index = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isAddingPoint, setIsAddingPoint] = useState(false);

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

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Control Panel */}
      <div className="w-full max-w-sm border-r border-border flex flex-col shadow-lg z-10">
        <ControlPanel
          points={points}
          centerPoint={centerPoint}
          isAddingPoint={isAddingPoint}
          isCalculating={isCalculating}
          isGoogleLoaded={!!apiKey}
          onToggleAddPoint={() => setIsAddingPoint(!isAddingPoint)}
          onAddressSelect={handleAddressSelect}
          onRemovePoint={removePoint}
          onClearAll={clearAll}
          onCalculate={calculateCenter}
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
          apiKey={apiKey}
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
