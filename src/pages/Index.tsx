import { useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { ControlPanel } from '@/components/map/ControlPanel';
import { MapContainer } from '@/components/map/MapContainer';
import { useMapPoints } from '@/hooks/useMapPoints';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

// Default demo key - users should replace with their own
const DEFAULT_API_KEY = '';

const Index = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('googleMapsApiKey') || DEFAULT_API_KEY;
  });
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!apiKey);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

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

  const handleSaveApiKey = () => {
    localStorage.setItem('googleMapsApiKey', tempApiKey);
    setApiKey(tempApiKey);
    setIsSettingsOpen(false);
    // Reload to reinitialize Google Maps
    if (tempApiKey !== apiKey) {
      window.location.reload();
    }
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
          isGoogleLoaded={isLoaded}
          onToggleAddPoint={() => setIsAddingPoint(!isAddingPoint)}
          onAddressSelect={handleAddressSelect}
          onRemovePoint={removePoint}
          onClearAll={clearAll}
          onCalculate={calculateCenter}
        />

        {/* Settings Button */}
        <div className="p-4 border-t border-border">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Settings className="h-4 w-4 mr-2" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="font-display">Google Maps API Key</DialogTitle>
                <DialogDescription>
                  Enter your Google Maps API key to enable the map. You need Places API and Maps JavaScript API enabled.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleSaveApiKey} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Save & Reload
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get your API key from the{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!apiKey ? (
          <div className="flex items-center justify-center h-full bg-secondary">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                API Key Required
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Please add your Google Maps API key to use the map.
                Click the "API Settings" button in the sidebar.
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            points={points}
            centerPoint={centerPoint}
            isAddingPoint={isAddingPoint}
            onMapClick={handleMapClick}
            onMarkerDrag={updatePoint}
            apiKey={apiKey}
          />
        )}

        {/* Adding Point Indicator */}
        {isAddingPoint && apiKey && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg text-sm font-medium animate-pulse">
            Click anywhere on the map to add a point
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
