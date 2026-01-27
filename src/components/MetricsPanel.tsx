import React from 'react';
import { cn } from '@/lib/utils';
import { Users, Clock, TrendingUp, Activity, UserCheck, Zap } from 'lucide-react';
import type { SimulationState, Gate } from '@/types/event-flow';

interface MetricsPanelProps {
  simulation: SimulationState;
  gates: Gate[];
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ simulation, gates, totalSpectators: propTotalSpectators }) => {
  const totalProcessed = gates.reduce((sum, g) => sum + g.throughput, 0);
  const totalQueue = gates.reduce((sum, g) => sum + g.currentQueue, 0);
  
  // Calculate system load based on gate utilization (average queue percentage)
  const avgCapacity = gates.length > 0
    ? Math.round(
        gates.reduce((sum, g) => {
          const utilization = (g.currentQueue / g.capacity) * 100;
          return sum + utilization;
        }, 0) / gates.length
      )
    : 0;
  
  // Use provided totalSpectators or fall back to simulation value
  const totalSpectators = propTotalSpectators ?? simulation.totalSpectators;

  const metrics = [
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Total Spectators',
      value: totalSpectators.toLocaleString(),
      subvalue: 'Expected today',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: 'Entered',
      value: simulation.enteredSpectators.toLocaleString(),
      subvalue: `${totalSpectators > 0 ? Math.round((simulation.enteredSpectators / totalSpectators) * 100) : 0}% complete`,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'In Queue',
      value: totalQueue.toLocaleString(),
      subvalue: `Across ${gates.length} gates`,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Avg Wait',
      value: `${simulation.avgWaitTime}min`,
      subvalue: '-23% vs baseline',
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: 'down',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Throughput',
      value: totalProcessed.toLocaleString(),
      subvalue: 'Total processed',
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'System Load',
      value: `${avgCapacity}%`,
      subvalue: avgCapacity < 50 ? 'Healthy' : avgCapacity < 75 ? 'Moderate' : 'High',
      color: avgCapacity < 50 ? 'text-success' : avgCapacity < 75 ? 'text-accent' : 'text-destructive',
      bg: avgCapacity < 50 ? 'bg-success/10' : avgCapacity < 75 ? 'bg-accent/10' : 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="glass-card p-4 animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', metric.bg, metric.color)}>
              {metric.icon}
            </div>
          </div>
          <p className="text-2xl font-display font-bold tracking-tight">
            {metric.value}
          </p>
          <p className="text-xs text-muted-foreground">{metric.label}</p>
          <p className={cn('text-[10px] mt-1', metric.color)}>
            {metric.subvalue}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MetricsPanel;
