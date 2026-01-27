import React, { useMemo } from 'react';
import type { Gate, Spectator } from '@/types/event-flow';
import { cn } from '@/lib/utils';

interface StadiumVisualizationProps {
  gates: Gate[];
  spectators: Spectator[];
  onGateClick?: (gateId: string) => void;
}

const StadiumVisualization: React.FC<StadiumVisualizationProps> = ({
  gates,
  spectators,
  onGateClick,
}) => {
  const getStatusColor = (status: Gate['status']) => {
    switch (status) {
      case 'optimal': return 'hsl(142, 76%, 45%)';
      case 'moderate': return 'hsl(45, 93%, 58%)';
      case 'congested': return 'hsl(25, 95%, 53%)';
      case 'critical': return 'hsl(0, 72%, 51%)';
    }
  };

  const getSpectatorColor = (status: Spectator['status']) => {
    switch (status) {
      case 'approaching': return 'hsl(174, 72%, 56%)';
      case 'queued': return 'hsl(45, 93%, 58%)';
      case 'entered': return 'hsl(142, 76%, 45%)';
      case 'delayed': return 'hsl(0, 72%, 51%)';
    }
  };

  const visibleSpectators = useMemo(() => {
    return spectators.filter(s => s.status !== 'entered').slice(0, 500);
  }, [spectators]);

  return (
    <div className="relative w-full h-full min-h-[400px] glass-card p-4 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Stadium SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        {/* Stadium outline */}
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="38"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          className="opacity-50"
        />
        
        {/* Field */}
        <ellipse
          cx="50"
          cy="50"
          rx="25"
          ry="20"
          fill="hsl(142, 76%, 20%)"
          opacity="0.3"
          stroke="hsl(142, 76%, 45%)"
          strokeWidth="0.3"
        />
        
        {/* Field markings */}
        <line x1="50" y1="30" x2="50" y2="70" stroke="hsl(var(--foreground))" strokeWidth="0.2" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="8" ry="6" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.2" opacity="0.3" />

        {/* Spectator dots */}
        {visibleSpectators.map((spec) => (
          <circle
            key={spec.id}
            cx={spec.position.x}
            cy={spec.position.y}
            r="0.5"
            fill={getSpectatorColor(spec.status)}
            opacity={0.8}
            className="transition-all duration-100"
          >
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Gates */}
        {gates.map((gate) => (
          <g
            key={gate.id}
            className="cursor-pointer"
            onClick={() => onGateClick?.(gate.id)}
          >
            {/* Gate glow */}
            <circle
              cx={gate.position.x}
              cy={gate.position.y}
              r="5"
              fill={getStatusColor(gate.status)}
              opacity={0.2}
              className="animate-pulse"
            />
            
            {/* Gate marker */}
            <circle
              cx={gate.position.x}
              cy={gate.position.y}
              r="3"
              fill={getStatusColor(gate.status)}
              stroke="hsl(var(--background))"
              strokeWidth="0.5"
              className="transition-all duration-300 hover:r-4"
            />
            
            {/* Gate label */}
            <text
              x={gate.position.x}
              y={gate.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--background))"
              fontSize="2"
              fontWeight="bold"
              fontFamily="Orbitron"
            >
              {gate.id}
            </text>
            
            {/* Queue count */}
            <text
              x={gate.position.x}
              y={gate.position.y + 6}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="1.5"
              opacity="0.8"
            >
              {gate.currentQueue}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Optimal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">Congested</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Critical</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4">
        <h3 className="font-display text-sm text-primary">LIVE STADIUM VIEW</h3>
        <p className="text-xs text-muted-foreground">Real-time crowd density</p>
      </div>
    </div>
  );
};

export default StadiumVisualization;
