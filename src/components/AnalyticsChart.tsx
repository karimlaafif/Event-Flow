import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { Gate } from '@/types/event-flow';

interface AnalyticsChartProps {
  gates: Gate[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ gates }) => {
  const data = useMemo(() => {
    return gates.map(gate => ({
      name: `Gate ${gate.id}`,
      queue: gate.currentQueue,
      capacity: gate.capacity,
      throughput: gate.throughput,
      utilization: Math.round((gate.currentQueue / gate.capacity) * 100),
    }));
  }, [gates]);

  const timeData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        arrivals: Math.floor(200 + Math.random() * 150 + i * 20),
        processed: Math.floor(180 + Math.random() * 100 + i * 25),
      };
    });
  }, []);

  return (
    <div className="glass-card p-4 h-full">
      <h3 className="font-display text-sm text-primary tracking-wider mb-4">
        THROUGHPUT ANALYSIS
      </h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeData}>
            <defs>
              <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
            />
            <Area
              type="monotone"
              dataKey="arrivals"
              stroke="hsl(174, 72%, 56%)"
              fillOpacity={1}
              fill="url(#colorArrivals)"
              strokeWidth={2}
              name="Arrivals"
            />
            <Area
              type="monotone"
              dataKey="processed"
              stroke="hsl(142, 76%, 45%)"
              fillOpacity={1}
              fill="url(#colorProcessed)"
              strokeWidth={2}
              name="Processed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Arrivals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Processed</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
