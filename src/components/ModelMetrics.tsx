import React from 'react';
import type { ModelMetrics, ModelPrediction } from '@/types/event-flow';
import { Brain, TrendingUp, Target, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ModelMetricsProps {
  metrics: ModelMetrics;
  predictions: Map<string, ModelPrediction>;
}

const ModelMetrics: React.FC<ModelMetricsProps> = ({ metrics, predictions }) => {
  const avgConfidence = predictions.size > 0
    ? Array.from(predictions.values()).reduce((sum, p) => sum + p.confidence, 0) / predictions.size
    : 0;

  const riskDistribution = {
    critical: Array.from(predictions.values()).filter(p => p.riskLevel === 'critical').length,
    high: Array.from(predictions.values()).filter(p => p.riskLevel === 'high').length,
    medium: Array.from(predictions.values()).filter(p => p.riskLevel === 'medium').length,
    low: Array.from(predictions.values()).filter(p => p.riskLevel === 'low').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="glass-card border-primary/30 animate-slide-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            LSTM MODEL PERFORMANCE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-semibold text-success">
                  {(metrics.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.accuracy * 100} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">F1 Score</span>
                <span className="font-semibold text-primary">
                  {(metrics.f1Score * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.f1Score * 100} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Precision</span>
                <span className="font-semibold text-accent">
                  {(metrics.precision * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.precision * 100} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Recall</span>
                <span className="font-semibold text-warning">
                  {(metrics.recall * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.recall * 100} className="h-2" />
            </div>
          </div>

          {/* Error Metrics */}
          <div className="pt-2 border-t border-secondary/50">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">MAE: </span>
                <span className="font-semibold">{metrics.mae.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">RMSE: </span>
                <span className="font-semibold">{metrics.rmse.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Prediction Stats */}
          <div className="pt-2 border-t border-secondary/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Active Predictions
              </span>
              <span className="font-semibold">{predictions.size}</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Avg Confidence
              </span>
              <span className="font-semibold text-primary">
                {(avgConfidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total Predictions
              </span>
              <span className="font-semibold">{metrics.totalPredictions.toLocaleString()}</span>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="pt-2 border-t border-secondary/50">
            <div className="text-xs text-muted-foreground mb-2">Risk Distribution</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded bg-destructive/10 border border-destructive/30 transition-all hover:scale-105">
                <div className="text-lg font-bold text-destructive">{riskDistribution.critical}</div>
                <div className="text-[10px] text-muted-foreground">Critical</div>
              </div>
              <div className="text-center p-2 rounded bg-warning/10 border border-warning/30 transition-all hover:scale-105">
                <div className="text-lg font-bold text-warning">{riskDistribution.high}</div>
                <div className="text-[10px] text-muted-foreground">High</div>
              </div>
              <div className="text-center p-2 rounded bg-accent/10 border border-accent/30 transition-all hover:scale-105">
                <div className="text-lg font-bold text-accent">{riskDistribution.medium}</div>
                <div className="text-[10px] text-muted-foreground">Medium</div>
              </div>
              <div className="text-center p-2 rounded bg-success/10 border border-success/30 transition-all hover:scale-105">
                <div className="text-lg font-bold text-success">{riskDistribution.low}</div>
                <div className="text-[10px] text-muted-foreground">Low</div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-2 border-t border-secondary/50 text-[10px] text-muted-foreground">
            Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelMetrics;

