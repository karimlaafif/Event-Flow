import React from 'react';
import GoogleMapWithFallback from './GoogleMapWithFallback';
import type { Gate } from '@/types/event-flow';

interface MoroccoMapProps {
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

const MoroccoMap: React.FC<MoroccoMapProps> = ({
  gates = [],
  userLocation,
  recommendedPath = [],
  userMarkers = [],
  mode = 'user',
}) => {
  return (
    <GoogleMapWithFallback
      gates={gates}
      userLocation={userLocation}
      recommendedPath={recommendedPath}
      userMarkers={userMarkers}
      mode={mode}
    />
  );
};

export default MoroccoMap;
