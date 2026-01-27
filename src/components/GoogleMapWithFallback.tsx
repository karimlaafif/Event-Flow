import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, Satellite, Map, Navigation, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { Gate } from '@/types/event-flow';

interface GoogleMapWithFallbackProps {
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

// Adrar Stadium gate locations (Agadir coordinates)
const STADIUM_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  A: { lat: 30.4278, lng: -9.5981, name: 'Gate A - North' },
  B: { lat: 30.4285, lng: -9.5975, name: 'Gate B - Northeast' },
  C: { lat: 30.4295, lng: -9.5980, name: 'Gate C - Southeast' },
  D: { lat: 30.4290, lng: -9.5995, name: 'Gate D - South' },
  E: { lat: 30.4280, lng: -9.6000, name: 'Gate E - Southwest' },
  F: { lat: 30.4270, lng: -9.5985, name: 'Gate F - Northwest' },
};

// Center of Agadir, Morocco
const AGADIR_CENTER = { lat: 30.4278, lng: -9.5981 };

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Multiple map image sources with different types
const MAP_SOURCES = {
  satellite: [
    `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/30.4278,-9.5981,15,0/1200x800?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/10922/16384`,
    `https://tile.openstreetmap.org/15/16384/10922.png`,
  ],
  traffic: [
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/30.4278,-9.5981,15,0/1200x800?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
    `https://staticmap.openstreetmap.de/staticmap.php?center=30.4278,-9.5981&zoom=15&size=1200x800&maptype=mapnik&markers=30.4278,-9.5981,red-pushpin`,
  ],
  street: [
    `https://staticmap.openstreetmap.de/staticmap.php?center=30.4278,-9.5981&zoom=15&size=1200x800&maptype=mapnik&markers=30.4278,-9.5981,red-pushpin`,
    `https://tile.openstreetmap.org/15/16384/10922.png`,
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/30.4278,-9.5981,15,0/1200x800?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
  ],
};

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Dynamic Fallback Map Component
const FallbackMap: React.FC<{
  gates: Gate[];
  mode: 'user' | 'admin';
}> = ({ gates, mode }) => {
  const [mapType, setMapType] = useState<'satellite' | 'traffic' | 'street'>('satellite');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(15);

  const currentSources = MAP_SOURCES[mapType];
  const currentImage = currentSources[currentImageIndex] || currentSources[0];

  const handleImageError = () => {
    if (currentImageIndex < currentSources.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  const handleMapTypeChange = (type: 'satellite' | 'traffic' | 'street') => {
    setMapType(type);
    setCurrentImageIndex(0);
    setImageError(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 10));
  };

  const handleRefresh = () => {
    setCurrentImageIndex(0);
    setImageError(false);
  };

  // Gate positions on map (approximate percentages)
  const gatePositions: Record<string, { x: number; y: number }> = {
    A: { x: 50, y: 30 },  // Gate A - North (center-top)
    B: { x: 65, y: 25 },  // Gate B - Northeast
    C: { x: 70, y: 50 },  // Gate C - Southeast
    D: { x: 55, y: 70 },  // Gate D - South
    E: { x: 35, y: 75 },  // Gate E - Southwest
    F: { x: 30, y: 45 },  // Gate F - Northwest
  };

  return (
    <Card className="glass-card border-primary/30 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {mode === 'user' ? 'Route Map - Agadir Stadium' : 'User Tracking Map - Agadir Stadium'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMapTypeChange('satellite')}
              className="h-7 px-2"
            >
              <Satellite className="w-3 h-3" />
            </Button>
            <Button
              variant={mapType === 'traffic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMapTypeChange('traffic')}
              className="h-7 px-2"
            >
              <Navigation className="w-3 h-3" />
            </Button>
            <Button
              variant={mapType === 'street' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMapTypeChange('street')}
              className="h-7 px-2"
            >
              <Map className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[500px] w-full rounded-b-lg overflow-hidden">
          {!imageError ? (
            <img
              key={`${mapType}-${currentImageIndex}-${zoom}`}
              src={currentImage}
              alt={`Agadir Stadium ${mapType} view`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={handleImageError}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground mb-2">Map Loading...</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Overlay markers for gates */}
          <div className="absolute inset-0 p-4 pointer-events-none">
            <div className="relative w-full h-full">
              {gates && gates.length > 0 && gates.map((gate) => {
                const location = STADIUM_LOCATIONS[gate.id];
                if (!location) return null;
                
                const pos = gatePositions[gate.id] || { x: 50, y: 50 };
                const statusColor = 
                  gate.status === 'optimal' ? 'bg-green-500' :
                  gate.status === 'moderate' ? 'bg-yellow-500' :
                  gate.status === 'congested' ? 'bg-orange-500' : 'bg-red-500';
                
                return (
                  <div
                    key={gate.id}
                    className="absolute pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={`${location.name} - Status: ${gate.status} - Queue: ${gate.currentQueue}/${gate.capacity}`}
                  >
                    <div className={`${statusColor} text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border-2 border-white/50 backdrop-blur-sm`}>
                      {location.name}
                    </div>
                  </div>
                );
              })}
              
              {/* User location marker */}
              <div
                className="absolute bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border-2 border-white/50 backdrop-blur-sm pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                title="Your Location"
              >
                Your Location
              </div>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Using {mapType.charAt(0).toUpperCase() + mapType.slice(1)} Map View
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Interactive map is temporarily unavailable. Showing Agadir Stadium area with {mapType} view.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-muted-foreground">Zoom: {zoom}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-7 w-7 p-0 pointer-events-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GoogleMapWithFallback: React.FC<GoogleMapWithFallbackProps> = ({
  gates = [],
  userLocation,
  recommendedPath = [],
  userMarkers = [],
  mode = 'user',
}) => {
  const [mapError, setMapError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Default location
  const defaultLocation = userLocation || AGADIR_CENTER;
  const center = { lat: defaultLocation.lat, lng: defaultLocation.lng };

  // Process path coordinates
  const pathCoordinates = React.useMemo(() => {
    if (!recommendedPath || recommendedPath.length === 0) return [];
    
    const coords = recommendedPath
      .filter(gateId => gateId && typeof gateId === 'string')
      .map(gateId => {
        const location = STADIUM_LOCATIONS[gateId];
        return location ? { lat: location.lat, lng: location.lng } : null;
      })
      .filter((coord): coord is { lat: number; lng: number } => coord !== null);

    if (defaultLocation && coords.length > 0) {
      coords.unshift({ lat: defaultLocation.lat, lng: defaultLocation.lng });
    }
    return coords;
  }, [recommendedPath, defaultLocation]);

  const onMapLoad = useCallback(() => {
    console.log('Google Maps loaded successfully');
  }, []);

  const onMapError = useCallback((error: Error) => {
    console.error('Google Maps failed to load:', error);
    setMapError(true);
  }, []);

  // If no API key or error occurred, show fallback immediately
  if (!GOOGLE_MAPS_API_KEY || mapError) {
    return <FallbackMap gates={gates} mode={mode} />;
  }

  // Render Google Maps
  return (
    <Card className="glass-card border-primary/30 h-full">
      <CardHeader>
        <CardTitle className="font-display text-sm">
          {mode === 'user' ? 'Route Map - Follow Your Path' : 'User Tracking Map'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full rounded-b-lg overflow-hidden">
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            onLoad={onMapLoad}
            onError={onMapError}
            loadingElement={
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Loading Google Maps...</p>
              </div>
            }
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              options={defaultOptions}
              onLoad={onMapLoad}
            >
              {/* User location marker */}
              <Marker
                position={center}
                title="Your Location"
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                }}
                onClick={() => setSelectedMarker('user')}
              />

              {/* Gate markers */}
              {gates && gates.length > 0 && gates.map(gate => {
                const location = STADIUM_LOCATIONS[gate.id];
                if (!location) return null;

                const statusColor = 
                  gate.status === 'optimal' ? 'green' :
                  gate.status === 'moderate' ? 'yellow' :
                  gate.status === 'congested' ? 'orange' : 'red';

                return (
                  <Marker
                    key={gate.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    title={location.name}
                    icon={{
                      url: `https://maps.google.com/mapfiles/ms/icons/${statusColor}-dot.png`,
                    }}
                    onClick={() => setSelectedMarker(`gate-${gate.id}`)}
                  >
                    {selectedMarker === `gate-${gate.id}` && (
                      <InfoWindow
                        onCloseClick={() => setSelectedMarker(null)}
                        position={{ lat: location.lat, lng: location.lng }}
                      >
                        <div className="text-sm">
                          <p className="font-semibold">{location.name}</p>
                          <p className="text-xs">Status: <span className="font-medium">{gate.status?.toUpperCase() || 'UNKNOWN'}</span></p>
                          <p className="text-xs">Queue: {gate.currentQueue || 0}/{gate.capacity || 0}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}

              {/* User markers (for admin tracking) */}
              {mode === 'admin' && userMarkers && userMarkers.length > 0 && userMarkers.map(user => {
                if (!user || !user.id || typeof user.lat !== 'number' || typeof user.lng !== 'number') {
                  return null;
                }

                const lat = isNaN(user.lat) ? AGADIR_CENTER.lat : user.lat;
                const lng = isNaN(user.lng) ? AGADIR_CENTER.lng : user.lng;

                return (
                  <Marker
                    key={user.id}
                    position={{ lat, lng }}
                    title={user.name || `User ${user.id.slice(0, 8)}`}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    }}
                    onClick={() => setSelectedMarker(`user-${user.id}`)}
                  >
                    {selectedMarker === `user-${user.id}` && (
                      <InfoWindow
                        onCloseClick={() => setSelectedMarker(null)}
                        position={{ lat, lng }}
                      >
                        <div className="text-sm">
                          <p className="font-semibold">{user.name || `User ${user.id.slice(0, 8)}`}</p>
                          <p className="text-xs">Gate: {user.gate || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {lat.toFixed(4)}, {lng.toFixed(4)}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}

              {/* Recommended path polyline */}
              {pathCoordinates.length > 1 && (
                <Polyline
                  path={pathCoordinates}
                  options={{
                    strokeColor: '#10b981',
                    strokeWeight: 4,
                    strokeOpacity: 0.7,
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapWithFallback;
