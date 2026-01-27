import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSimulation } from '@/hooks/useSimulation';
import QRScanner from '@/components/QRScanner';
import AIChatbot from '@/components/AIChatbot';
import MapWrapper from '@/components/MapWrapper';
import Logo from '@/components/Logo';
import ErrorBoundary from '@/components/ErrorBoundary';
import { recommendationService } from '@/services/RecommendationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Navigation, LogOut, Shield } from 'lucide-react';
import type { PathRecommendation } from '@/services/RecommendationService';

const UserSession: React.FC = () => {
  const { user, logout, loginAsUser } = useAuth();
  const navigate = useNavigate();
  const { gates } = useSimulation(1000);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);
  const [recommendations, setRecommendations] = useState<PathRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PathRecommendation | null>(null);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 }); // Default center position
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-login as user if not logged in (for QR scanner access)
  useEffect(() => {
    if (!user) {
      try {
        loginAsUser();
      } catch (error) {
        console.error('Auto-login failed:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user to avoid infinite loops

  // Get user's current location (Morocco coordinates) - Always set location when ticket is scanned
  useEffect(() => {
    if (ticketId) {
      // Always set a default location first
      setUserLocation({
        lat: 33.5731,
        lng: -7.5898,
      });

      // Try to get actual location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            // Keep default location if geolocation fails
            console.log('Geolocation not available, using default location');
          },
          { timeout: 5000 } // 5 second timeout
        );
      }
    }
  }, [ticketId]);

  const handleQRScan = (scannedId: string) => {
    try {
      setIsLoading(true);
      setTicketId(scannedId);
      setShowScanner(false);
      
      // Always set default location immediately
      setUserLocation({
        lat: 33.5731,
        lng: -7.5898,
      });
      
      // Generate recommendations based on current position
      if (gates.length > 0) {
        try {
          const recs = recommendationService.recommendBestGate(userPosition, gates);
          setRecommendations(recs);
          if (recs.length > 0) {
            setSelectedRecommendation(recs[0]);
          }
        } catch (recError) {
          console.error('Error generating recommendations:', recError);
          // Continue without recommendations
        }
      }
    } catch (error) {
      console.error('Error processing QR scan:', error);
      // Still set ticket ID and location even if recommendations fail
      setTicketId(scannedId);
      setShowScanner(false);
      setUserLocation({
        lat: 33.5731,
        lng: -7.5898,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      // Reset all state
      setTicketId(null);
      setShowScanner(true);
      setRecommendations([]);
      setSelectedRecommendation(null);
      setUserLocation(undefined);
      setIsLoading(false);
      
      // Logout
      logout();
      
      // Navigate to home - use window.location for reliability
      setTimeout(() => {
        window.location.href = '/';
      }, 50);
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation on any error
      window.location.href = '/';
    }
  };

  const handleAdminAccess = () => {
    try {
      navigate('/admin/login');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/admin/login';
    }
  };

  if (showScanner && !ticketId) {
    return (
      <div className="min-h-screen bg-background relative p-6">
        <div className="container mx-auto max-w-3xl">
          {/* Header with Logo */}
          <div className="flex justify-between items-center mb-8">
            <Logo size="lg" showText={true} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAdminAccess}
              className="border-accent/50 hover:bg-accent/10 hover:border-accent"
              disabled={isLoading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-2 gradient-text-primary">
              Welcome to Event Flow
            </h2>
            <p className="text-muted-foreground text-lg">
              Scan your ticket to get personalized route recommendations
            </p>
          </div>

          {/* QR Scanner Card */}
          <div className="animate-slide-in">
            {isLoading ? (
              <Card className="glass-card border-primary/30 p-8 text-center">
                <div className="animate-pulse">
                  <p className="text-muted-foreground">Processing your ticket...</p>
                </div>
              </Card>
            ) : (
              <QRScanner onScan={handleQRScan} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="glass-card px-6 py-4 flex items-center justify-between sticky top-0 z-50 mb-6 border-b border-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Logo size="md" showText={true} />
          <div className="h-6 w-px bg-border/50" />
          <div>
            <p className="text-xs text-muted-foreground">Ticket ID</p>
            <p className="text-sm font-medium text-foreground">
              {ticketId?.slice(0, 16)}...
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Exit
        </Button>
      </header>

      <main className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recommendations Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-lg">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-display text-lg flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Navigation className="w-5 h-5 text-primary" />
                  </div>
                  <span className="gradient-text-primary">Recommended Route</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRecommendation ? (
                  <div className="space-y-4 pt-4">
                    <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/30 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-xl gradient-text-primary">{selectedRecommendation.gateName}</h3>
                          <span className="text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 rounded-full shadow-lg">
                            BEST OPTION
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-full bg-primary/10 w-fit mx-auto mb-2">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Total Time</p>
                            <p className="text-xl font-bold text-primary">{selectedRecommendation.totalTime} min</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-full bg-accent/10 w-fit mx-auto mb-2">
                              <MapPin className="w-5 h-5 text-accent" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Distance</p>
                            <p className="text-xl font-bold text-accent">{selectedRecommendation.distance} units</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="p-2 rounded-full bg-warning/10 w-fit mx-auto mb-2">
                              <Users className="w-5 h-5 text-warning" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Wait Time</p>
                            <p className="text-xl font-bold text-warning">{selectedRecommendation.waitTime} min</p>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/50">
                          <p className="text-sm font-medium text-foreground mb-3">Route Path:</p>
                          <div className="flex gap-2 flex-wrap items-center">
                            {selectedRecommendation.path.map((gate, idx) => (
                              <React.Fragment key={gate}>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg text-sm font-semibold text-foreground shadow-sm">
                                  Gate {gate}
                                </span>
                                {idx < selectedRecommendation.path.length - 1 && (
                                  <span className="text-primary text-lg font-bold">→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Routes */}
                    {recommendations.length > 1 && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold mb-3 text-foreground">Alternative Routes:</p>
                        <div className="space-y-3">
                          {recommendations.slice(1, 4).map((rec, idx) => (
                            <button
                              key={rec.gateId}
                              onClick={() => setSelectedRecommendation(rec)}
                              className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                                selectedRecommendation?.gateId === rec.gateId
                                  ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]'
                                  : 'border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-base mb-1">{rec.gateName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {rec.totalTime} min total • {rec.waitTime} min wait
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">#{idx + 2}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recommendations available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Chatbot */}
          <div className="lg:col-span-1">
            <AIChatbot ticketId={ticketId || undefined} />
          </div>
        </div>

        {/* Morocco Map for Route - Always show when ticket is scanned */}
        {ticketId && userLocation && (
          <div className="mt-6">
            <ErrorBoundary
              fallback={
                <Card className="glass-card border-primary/30 p-6">
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Map is temporarily unavailable. Your route information is still available above.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Just reload the map component, not the whole page
                          window.location.reload();
                        }}
                      >
                        Reload Map
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          // Stay on page, just hide the error
                          const errorBoundary = document.querySelector('[data-error-boundary]');
                          if (errorBoundary) {
                            errorBoundary.remove();
                          }
                        }}
                      >
                        Continue Without Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <MapWrapper
                gates={gates || []}
                userLocation={userLocation}
                recommendedPath={selectedRecommendation?.path || []}
                mode="user"
              />
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserSession;

