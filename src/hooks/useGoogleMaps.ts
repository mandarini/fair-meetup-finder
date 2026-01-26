import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Define callback function
    window.initGoogleMaps = () => {
      setIsLoaded(true);
      delete window.initGoogleMaps; // Cleanup
    };

    // Load the Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps'));
      delete window.initGoogleMaps;
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      delete window.initGoogleMaps;
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com/maps/api/js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
}
