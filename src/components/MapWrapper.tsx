import React, { useState, useEffect, Suspense } from 'react';
import MoroccoMap from './MoroccoMap';
import ErrorBoundary from './ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Gate } from '@/types/event-flow';

interface MapWrapperProps {
  gates: Gate[];
  userLocation?: { lat: number; lng: number };
  recommendedPath?: string[];
  userMarkers?: Array<{
    id: string;
    lat: number;
    lng: number;
    name?: string;
    gate?: string;
  }>;
  mode?: 'user' | 'admin';
}

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="glass-card border-primary/30 h-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className="glass-card border-primary/30 h-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Map is temporarily unavailable.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setMapError(false);
              window.location.reload();
            }}
          >
            Reload Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Suspense
      fallback={
        <Card className="glass-card border-primary/30 h-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading map...</p>
          </CardContent>
        </Card>
      }
    >
      <ErrorBoundary
        fallback={
          <Card className="glass-card border-primary/30 h-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Map failed to load. Please refresh the page.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        }
      >
        <MoroccoMap {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default MapWrapper;

