import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { QrCode, MapPin, Clock, Trophy, Ticket as TicketIcon } from 'lucide-react';

interface SmartTicketProps {
  gateStatus?: 'optimal' | 'moderate' | 'congested' | 'critical';
}

const SmartTicket: React.FC<SmartTicketProps> = ({ gateStatus = 'optimal' }) => {
  const [qrPulse, setQrPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQrPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    optimal: 'from-success to-emerald-400',
    moderate: 'from-accent to-amber-400',
    congested: 'from-warning to-orange-400',
    critical: 'from-destructive to-red-400',
  };

  const statusLabels = {
    optimal: 'Gate Clear - Proceed',
    moderate: 'Moderate Traffic',
    congested: 'Expect Delays',
    critical: 'Rerouting...',
  };

  return (
    <div className="glass-card overflow-hidden max-w-sm mx-auto">
      {/* Header with gradient */}
      <div className={cn(
        'bg-gradient-to-r p-4 text-primary-foreground',
        statusColors[gateStatus]
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5" />
            <span className="font-display text-sm font-bold tracking-wider">
              EVENT FLOW AI
            </span>
          </div>
          <span className="text-xs font-medium bg-primary-foreground/20 px-2 py-0.5 rounded">
            CAN 2025
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="p-5">
        {/* QR Code */}
        <div className="flex justify-center mb-5">
          <div className={cn(
            'relative p-4 rounded-2xl bg-secondary transition-all duration-500',
            qrPulse && 'scale-[1.02]'
          )}>
            {/* Animated border */}
            <div className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-50',
              statusColors[gateStatus]
            )} style={{ padding: '2px' }}>
              <div className="w-full h-full bg-secondary rounded-2xl" />
            </div>
            
            {/* QR placeholder with animated grid */}
            <div className="relative w-32 h-32 grid grid-cols-8 gap-0.5 p-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-sm transition-all duration-300',
                    Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'
                  )}
                  style={{
                    animationDelay: `${i * 10}ms`,
                  }}
                />
              ))}
            </div>

            {/* Corner markers */}
            {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
              <div
                key={i}
                className={cn(
                  'absolute w-6 h-6 border-2 rounded-sm',
                  pos,
                  i < 2 ? 'border-b-0 border-r-0' : '',
                  i === 1 || i === 3 ? 'border-l-0' : '',
                  i >= 2 ? 'border-t-0' : '',
                  'border-primary'
                )}
              />
            ))}
          </div>
        </div>

        {/* Status indicator */}
        <div className={cn(
          'text-center py-2 px-4 rounded-lg mb-4 bg-gradient-to-r',
          statusColors[gateStatus]
        )}>
          <p className="font-display text-sm font-bold text-primary-foreground tracking-wider">
            {statusLabels[gateStatus]}
          </p>
        </div>

        {/* Ticket details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Gate</span>
            </div>
            <span className="font-display font-bold text-lg">A</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Arrival Window</span>
            </div>
            <span className="font-semibold">18:00 - 18:30</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="font-display font-bold">B</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Row</p>
              <p className="font-display font-bold">14</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Seat</p>
              <p className="font-display font-bold">23</p>
            </div>
          </div>

          {/* Gamification points */}
          <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-center gap-2 text-accent">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">On-time bonus</span>
            </div>
            <span className="font-display font-bold text-accent">+50 pts</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-secondary/30">
        <p className="text-center text-xs text-muted-foreground">
          Ticket ID: <span className="font-mono">EF-2025-042-A-B14-23</span>
        </p>
      </div>
    </div>
  );
};

export default SmartTicket;
