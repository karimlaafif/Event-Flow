export interface Gate {
  id: string;
  name: string;
  capacity: number;
  currentQueue: number;
  avgProcessTime: number;
  status: 'optimal' | 'moderate' | 'congested' | 'critical';
  position: { x: number; y: number };
  throughput: number;
}

export interface Spectator {
  id: string;
  profile: 'family' | 'ultra' | 'vip' | 'standard';
  assignedGate: string;
  position: { x: number; y: number };
  status: 'approaching' | 'queued' | 'entered' | 'delayed';
  arrivalTime: Date;
  estimatedWait: number;
}

export interface Ticket {
  id: string;
  spectatorId: string;
  gate: string;
  section: string;
  row: string;
  seat: string;
  arrivalWindow: { start: Date; end: Date };
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  points: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  gateId?: string;
  action?: string;
}

export interface PredictionData {
  timestamp: Date;
  gateId: string;
  predictedDensity: number;
  confidence: number;
  suggestedAction?: string;
}

export interface ModelFeatures {
  gateId: string;
  currentQueue: number;
  capacity: number;
  throughput: number;
  avgProcessTime: number;
  timeOfDay: number; // 0-24 hours
  dayOfWeek: number; // 0-6
  historicalAvg: number;
  trend: number; // -1 to 1
  nearbyGateUtilization: number;
}

export interface ModelPrediction {
  gateId: string;
  timestamp: Date;
  predictedQueue: number[];
  predictedDensity: number[];
  confidence: number;
  timeHorizon: number[]; // minutes ahead
  suggestedAction: 'maintain' | 'redirect' | 'increase-capacity' | 'alert';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedWaitTime: number[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  lastUpdated: Date;
  totalPredictions: number;
  correctPredictions: number;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  gateId: string;
  queue: number;
  throughput: number;
  waitTime: number;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  currentTime: Date;
  totalSpectators: number;
  enteredSpectators: number;
  avgWaitTime: number;
  crisisMode: boolean;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

export interface User {
  id: string;
  ticketId: string;
  name?: string;
  email?: string;
  phone?: string;
  profile: 'family' | 'ultra' | 'vip' | 'standard';
  assignedGate: string;
  currentLocation: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'at_gate' | 'entered';
  scanTime: Date;
  lastUpdate: Date;
  estimatedArrival?: Date;
  path?: string[];
}
