import React, { useMemo } from 'react';
import type { ModelPrediction } from '@/types/event-flow';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PredictionChartProps {
  prediction: ModelPrediction;
  gateName: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ prediction, gateName }) => {
  const chartData = useMemo(() => {
    return prediction.timeHorizon.map((minutes, idx) => ({
      time: `${minutes}m`,
      density: Math.round(prediction.predictedDensity[idx] * 100),
      queue: Math.round(prediction.predictedQueue[idx]),
      waitTime: Math.round(prediction.estimatedWaitTime[idx]),
    }));
  }, [prediction]);

  const riskConfig = {
    low: { color: 'hsl(142, 76%, 45%)', bg: 'bg-success/10', border: 'border-success/30' },
    medium: { color: 'hsl(45, 93%, 47%)', bg: 'bg-accent/10', border: 'border-accent/30' },
    high: { color: 'hsl(38, 92%, 50%)', bg: 'bg-warning/10', border: 'border-warning/30' },
    critical: { color: 'hsl(0, 84%, 60%)', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  };

  const config = riskConfig[prediction.riskLevel];

  const actionLabels = {
    maintain: 'Maintain',
    redirect: 'Redirect Flow',
    'increase-capacity': 'Increase Capacity',
    alert: 'Send Alert',
  };

  return (
    <Card className={`glass-card border ${config.border} transition-all duration-300 hover:scale-[1.02]`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display tracking-wider">
            {gateName}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${config.bg} ${config.border} text-xs uppercase`}
            style={{ borderColor: config.color }}
          >
            {prediction.riskLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="text-xs">
            <span className="text-muted-foreground">Confidence: </span>
            <span className="font-semibold text-primary">
              {(prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Action: </span>
            <span className="font-semibold text-accent">
              {actionLabels[prediction.suggestedAction]}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Max Density: </span>
            <span className="font-semibold" style={{ color: config.color }}>
              {(Math.max(...prediction.predictedDensity) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`colorDensity-${prediction.gateId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`colorQueue-${prediction.gateId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0}/>
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
                  border: `1px solid ${config.color}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="line"
              />
              <Area
                type="monotone"
                dataKey="density"
                stroke={config.color}
                fillOpacity={1}
                fill={`url(#colorDensity-${prediction.gateId})`}
                strokeWidth={2}
                name="Density %"
                dot={{ r: 4, fill: config.color }}
              />
              <Area
                type="monotone"
                dataKey="queue"
                stroke="hsl(174, 72%, 56%)"
                fillOpacity={1}
                fill={`url(#colorQueue-${prediction.gateId})`}
                strokeWidth={2}
                name="Queue Size"
                dot={{ r: 3, fill: 'hsl(174, 72%, 56%)' }}
              />
              <Line
                type="monotone"
                dataKey="waitTime"
                stroke="hsl(45, 93%, 47%)"
                strokeWidth={2}
                name="Wait Time (min)"
                dot={{ r: 3, fill: 'hsl(45, 93%, 47%)' }}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionChart;

