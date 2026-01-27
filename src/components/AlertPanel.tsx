import React from 'react';
import type { Alert } from '@/types/event-flow';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alert: Alert) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss, onAction }) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          container: 'border-destructive/50 bg-destructive/10',
          icon: 'text-destructive',
          title: 'text-destructive',
        };
      case 'warning':
        return {
          container: 'border-warning/50 bg-warning/10',
          icon: 'text-warning',
          title: 'text-warning',
        };
      case 'info':
        return {
          container: 'border-primary/50 bg-primary/10',
          icon: 'text-primary',
          title: 'text-primary',
        };
      case 'success':
        return {
          container: 'border-success/50 bg-success/10',
          icon: 'text-success',
          title: 'text-success',
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm text-primary tracking-wider">
          LIVE ALERTS
        </h3>
        <span className="text-xs text-muted-foreground">
          {alerts.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">All systems nominal</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border transition-all duration-300 animate-slide-up',
                  styles.container,
                  alert.type === 'critical' && 'animate-pulse'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-2">
                  <div className={cn('mt-0.5', styles.icon)}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn('font-medium text-sm truncate', styles.title)}>
                        {alert.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs mt-2"
                        onClick={() => onAction?.(alert)}
                      >
                        {alert.action}
                      </Button>
                    )}
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
