import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import MetricsPanel from '@/components/MetricsPanel';
import StadiumVisualization from '@/components/StadiumVisualization';
import GateCard from '@/components/GateCard';
import AlertPanel from '@/components/AlertPanel';
import UserManagement from '@/components/UserManagement';
import AnalyticsChart from '@/components/AnalyticsChart';
import ModelMetrics from '@/components/ModelMetrics';
import PredictionChart from '@/components/PredictionChart';
import MapWrapper from '@/components/MapWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, BarChart3, Brain, Map } from 'lucide-react';
import type { User } from '@/types/event-flow';

const Index = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin) {
      try {
        navigate('/admin/login');
      } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = '/admin/login';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]); // Only depend on isAdmin to avoid infinite loops

  const {
    gates,
    spectators,
    alerts,
    predictions,
    modelMetrics,
    simulation,
    startSimulation,
    stopSimulation,
    toggleCrisis,
    redirectGate,
  } = useSimulation(1000);

  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userMarkers, setUserMarkers] = useState<Array<{
    id: string;
    lat: number;
    lng: number;
    name?: string;
    gate?: string;
  }>>([]);

  // Generate user markers for tracking map
  useEffect(() => {
    try {
      if (!spectators || !gates || spectators.length === 0) {
        setUserMarkers([]);
        return;
      }

      const markers = spectators
        .filter(s => s && (s.status === 'approaching' || s.status === 'queued'))
        .slice(0, 20) // Show first 20 active users
        .map(spec => {
          try {
            // Convert stadium position to Morocco coordinates
            const baseLat = 33.5731;
            const baseLng = -7.5898;
            const offset = 0.01; // ~1km offset
            
            // Ensure position exists and has valid values
            const posY = spec.position?.y ?? 50;
            const posX = spec.position?.x ?? 50;
            
            return {
              id: spec.id || `user-${Date.now()}-${Math.random()}`,
              lat: baseLat + (posY - 50) * offset * 0.1,
              lng: baseLng + (posX - 50) * offset * 0.1,
              name: `User ${spec.id?.slice(-4) || 'Unknown'}`,
              gate: spec.assignedGate || undefined,
            };
          } catch (err) {
            console.warn('Error processing spectator:', err);
            return null;
          }
        })
        .filter((marker): marker is NonNullable<typeof marker> => marker !== null);
      
      setUserMarkers(markers);
    } catch (error) {
      console.error('Error generating user markers:', error);
      setUserMarkers([]);
    }
  }, [spectators, gates]);

  const handleToggleSimulation = () => {
    if (simulation.isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const handleRedirect = (fromGateId: string) => {
    // Find the gate with lowest utilization
    const targetGate = gates
      .filter(g => g.id !== fromGateId)
      .sort((a, b) => (a.currentQueue / a.capacity) - (b.currentQueue / b.capacity))[0];
    
    if (targetGate) {
      redirectGate(fromGateId, targetGate.id);
    }
  };

  const currentGateStatus = gates.length > 0 
    ? gates.find(g => g.id === 'A')?.status || 'optimal'
    : 'optimal';

  return (
    <div className="min-h-screen bg-background relative">
      <Header
        isRunning={simulation.isRunning}
        crisisMode={simulation.crisisMode}
        alerts={alerts}
        onToggleSimulation={handleToggleSimulation}
        onToggleCrisis={toggleCrisis}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Overview */}
        <MetricsPanel 
          simulation={simulation} 
          gates={gates} 
          totalSpectators={spectators.length}
        />

        {/* Tabs for different views */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="glass-card p-1 w-fit">
            <TabsTrigger value="dashboard" className="gap-2 font-display text-xs">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 font-display text-xs">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2 font-display text-xs">
              <Map className="w-4 h-4" />
              User Tracking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 font-display text-xs">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-2 font-display text-xs">
              <Brain className="w-4 h-4" />
              AI Model
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stadium Visualization */}
              <div className="lg:col-span-2 h-[500px]">
                <StadiumVisualization
                  gates={gates}
                  spectators={spectators}
                  onGateClick={setSelectedGate}
                />
              </div>

              {/* Alerts Panel */}
              <div className="h-[500px]">
                <AlertPanel alerts={alerts} />
              </div>
            </div>

            {/* Gate Cards */}
            <div className="mt-6">
              <h2 className="font-display text-sm text-primary tracking-wider mb-4">
                GATE STATUS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {gates.map(gate => (
                  <GateCard
                    key={gate.id}
                    gate={gate}
                    onRedirect={handleRedirect}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement 
              onUserSelect={(user) => {
                setSelectedUser(user);
                // Update map markers when user is selected
                if (user) {
                  setUserMarkers(prev => {
                    const exists = prev.find(m => m.id === user.id);
                    if (!exists) {
                      return [...prev, {
                        id: user.id,
                        lat: user.currentLocation.lat,
                        lng: user.currentLocation.lng,
                        name: user.name,
                        gate: user.assignedGate,
                      }];
                    }
                    return prev;
                  });
                }
              }} 
            />
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary
                fallback={
                  <Card className="glass-card border-primary/30 p-6">
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">
                        User tracking map is temporarily unavailable.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Reload Map
                      </Button>
                    </CardContent>
                  </Card>
                }
              >
                <MapWrapper
                  gates={gates || []}
                  userMarkers={userMarkers || []}
                  mode="admin"
                />
              </ErrorBoundary>
              <div className="space-y-4">
                <div className="glass-card p-6">
                  <h3 className="font-display text-sm text-primary tracking-wider mb-4">
                    TRACKING STATISTICS
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-1">
                        Active Users
                      </p>
                      <p className="text-2xl font-display font-bold">{userMarkers.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Currently tracked on map
                      </p>
                    </div>
                    <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                      <p className="text-sm font-medium text-success mb-1">
                        At Stadium
                      </p>
                      <p className="text-2xl font-display font-bold">
                        {userMarkers.filter(u => u.gate).length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Users near gates
                      </p>
                    </div>
                    {selectedUser && (
                      <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                        <p className="text-sm font-medium text-accent mb-1">
                          Selected User
                        </p>
                        <p className="text-lg font-display font-bold">
                          {selectedUser.name || selectedUser.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gate: {selectedUser.assignedGate} • Status: {selectedUser.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart gates={gates} />
              <div className="glass-card p-6">
                <h3 className="font-display text-sm text-primary tracking-wider mb-4">
                  AI INSIGHTS
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-sm font-medium text-success mb-1">
                      Efficiency Gain
                    </p>
                    <p className="text-2xl font-display font-bold">+34%</p>
                    <p className="text-xs text-muted-foreground">
                      vs. traditional management
                    </p>
                  </div>
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-1">
                      Wait Time Reduction
                    </p>
                    <p className="text-2xl font-display font-bold">-23 min</p>
                    <p className="text-xs text-muted-foreground">
                      Average per spectator
                    </p>
                  </div>
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm font-medium text-accent mb-1">
                      Predictions Accuracy
                    </p>
                    <p className="text-2xl font-display font-bold">
                      {(modelMetrics.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      30-minute forecast
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="model" className="mt-6">
            <div className="space-y-6">
              {/* Model Metrics */}
              <ModelMetrics metrics={modelMetrics} predictions={predictions} />
              
              {/* Prediction Charts for each gate */}
              <div>
                <h2 className="font-display text-sm text-primary tracking-wider mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  GATE PREDICTIONS
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Array.from(predictions.entries()).map(([gateId, prediction]) => {
                    const gate = gates.find(g => g.id === gateId);
                    if (!gate) return null;
                    return (
                      <PredictionChart
                        key={gateId}
                        prediction={prediction}
                        gateName={gate.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground text-sm">
          <p className="font-display tracking-wider text-primary">
            EVENT FLOW — INTELLIGENT CROWD MANAGEMENT
          </p>
          <p className="text-xs mt-1">
            Powered by LSTM Neural Networks & Real-time Optimization
          </p>
          <p className="text-xs mt-2 opacity-70">
            🏆 Intelligent Event Management System
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
