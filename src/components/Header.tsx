import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { Activity, Settings, Bell, Wifi, X, AlertTriangle, AlertCircle, Info, CheckCircle, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Alert } from '@/types/event-flow';

interface HeaderProps {
  isRunning: boolean;
  crisisMode: boolean;
  alerts: Alert[];
  onToggleSimulation: () => void;
  onToggleCrisis: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isRunning,
  crisisMode,
  alerts,
  onToggleSimulation,
  onToggleCrisis,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  const unreadAlerts = alerts.filter(a => {
    const timeDiff = Date.now() - a.timestamp.getTime();
    return timeDiff < 300000; // Alerts from last 5 minutes
  });
  
  const criticalAlerts = alerts.filter(a => a.type === 'critical' || a.type === 'warning');

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'warning': return <AlertCircle className="w-3 h-3 text-warning" />;
      case 'info': return <Info className="w-3 h-3 text-primary" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-success" />;
    }
  };
  return (
    <header className="glass-card px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Logo size="md" showText={true} />
            {isRunning && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full animate-pulse -translate-y-1 translate-x-1" />
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
          <Wifi className={cn(
            'w-3.5 h-3.5',
            isRunning ? 'text-success' : 'text-muted-foreground'
          )} />
          <span className="text-xs font-medium">
            {isRunning ? 'Live' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant={isRunning ? 'success' : 'outline'}
          size="sm"
          onClick={onToggleSimulation}
          className="gap-2"
        >
          <span className={cn(
            'w-2 h-2 rounded-full',
            isRunning ? 'bg-success-foreground animate-pulse' : 'bg-muted-foreground'
          )} />
          {isRunning ? 'Running' : 'Start Simulation'}
        </Button>

        <Button
          variant={crisisMode ? 'destructive' : 'outline'}
          size="sm"
          onClick={onToggleCrisis}
        >
          {crisisMode ? '⚠️ Crisis Active' : 'Trigger Crisis'}
        </Button>

        <div className="hidden md:flex items-center gap-2 ml-2">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
                {criticalAlerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-card border-border">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadAlerts.length > 0 && (
                  <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                    {unreadAlerts.length} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem
                      key={alert.id}
                      className="flex items-start gap-2 p-3 cursor-default focus:bg-secondary/50"
                    >
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {alerts.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center text-xs text-muted-foreground">
                    View all {alerts.length} alerts
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Dialog */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Settings</DialogTitle>
                <DialogDescription>
                  Configure your Event Flow preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Simulation Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Simulation Speed</span>
                    <span className="text-xs text-muted-foreground">{simulationSpeed}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                  </div>
                </div>

                {/* System Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Status</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                      <span className="text-xs">Simulation</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        isRunning ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {isRunning ? "Running" : "Stopped"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                      <span className="text-xs">Crisis Mode</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        crisisMode ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                      )}>
                        {crisisMode ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                      <span className="text-xs">Active Alerts</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">
                        {alerts.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-sm font-medium">About</label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Event Flow v2.0</p>
                    <p>Intelligent Event Management System</p>
                    <p>Powered by TensorFlow.js LSTM</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Admin Logout */}
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}

          {/* User View Link for Admin */}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="ml-2">
              <User className="w-4 h-4 mr-2" />
              User View
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
