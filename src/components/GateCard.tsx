import React from 'react';
import type { Gate } from '@/types/event-flow';
import { cn } from '@/lib/utils';
import { Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GateCardProps {
  gate: Gate;
  onRedirect?: (gateId: string) => void;
}

const GateCard: React.FC<GateCardProps> = ({ gate, onRedirect }) => {
  const statusConfig = {
    optimal: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      glow: 'glow-success',
      label: 'OPTIMAL',
    },
    moderate: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent',
      glow: 'glow-accent',
      label: 'MODERATE',
    },
    congested: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      glow: '',
      label: 'CONGESTED',
    },
    critical: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      text: 'text-destructive',
      glow: 'glow-danger',
      label: 'CRITICAL',
    },
  };

  const config = statusConfig[gate.status];
  const capacityPercent = Math.min(100, Math.round((gate.currentQueue / gate.capacity) * 100));

  return (
    <div
      className={cn(
        'glass-card p-4 border transition-all duration-300 hover:scale-[1.02]',
        config.border,
        gate.status === 'critical' && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', config.bg, config.text)}>
              <div className={cn('w-full h-full rounded-full', config.text === 'text-success' ? 'bg-success' : config.text === 'text-accent' ? 'bg-accent' : config.text === 'text-warning' ? 'bg-warning' : 'bg-destructive')} />
            </div>
            <h4 className="font-display text-sm font-semibold tracking-wider">
              GATE {gate.id}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{gate.name}</p>
        </div>
        <span className={cn('text-xs font-display px-2 py-0.5 rounded', config.bg, config.text)}>
          {config.label}
        </span>
      </div>

      {/* Capacity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Capacity</span>
          <span className={config.text}>{capacityPercent}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              capacityPercent < 30 ? 'bg-success' :
              capacityPercent < 60 ? 'bg-accent' :
              capacityPercent < 85 ? 'bg-warning' : 'bg-destructive'
            )}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <Users className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-xs font-semibold">{gate.currentQueue}</p>
          <p className="text-[10px] text-muted-foreground">Queue</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-xs font-semibold">{gate.avgProcessTime}s</p>
          <p className="text-[10px] text-muted-foreground">Avg Time</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <TrendingUp className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-xs font-semibold">{gate.throughput}</p>
          <p className="text-[10px] text-muted-foreground">Processed</p>
        </div>
      </div>

      {/* Redirect button */}
      {gate.status === 'critical' && onRedirect && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onRedirect(gate.id)}
        >
          Redirect Flow <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
};

export default GateCard;
