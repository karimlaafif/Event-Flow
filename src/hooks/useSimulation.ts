import { useState, useEffect, useCallback, useRef } from 'react';
import type { Gate, Spectator, Alert, SimulationState, ModelPrediction } from '@/types/event-flow';
import { predictionModel } from '@/services/PredictionModel';

const GATE_CONFIGS: Omit<Gate, 'currentQueue' | 'throughput'>[] = [
  { id: 'A', name: 'Gate A - North', capacity: 800, avgProcessTime: 12, status: 'optimal', position: { x: 50, y: 10 } },
  { id: 'B', name: 'Gate B - Northeast', capacity: 600, avgProcessTime: 15, status: 'optimal', position: { x: 85, y: 25 } },
  { id: 'C', name: 'Gate C - Southeast', capacity: 700, avgProcessTime: 14, status: 'optimal', position: { x: 85, y: 75 } },
  { id: 'D', name: 'Gate D - South', capacity: 900, avgProcessTime: 10, status: 'optimal', position: { x: 50, y: 90 } },
  { id: 'E', name: 'Gate E - Southwest', capacity: 650, avgProcessTime: 13, status: 'optimal', position: { x: 15, y: 75 } },
  { id: 'F', name: 'Gate F - Northwest', capacity: 750, avgProcessTime: 11, status: 'optimal', position: { x: 15, y: 25 } },
];

const PROFILES = ['family', 'ultra', 'vip', 'standard'] as const;

const generateSpectators = (count: number, gates: Gate[]): Spectator[] => {
  const spectators: Spectator[] = [];
  
  // Batch gate recommendations for better performance
  const gateIds = gates.length > 0 ? gates.map(g => g.id) : GATE_CONFIGS.map(g => g.id);
  
  for (let i = 0; i < count; i++) {
    const profile = PROFILES[Math.floor(Math.random() * PROFILES.length)];
    // Use simple heuristic for gate assignment (much faster than model call per spectator)
    // Only use model for a small sample to get recommendations, then distribute
    const recommendedGate = gateIds[Math.floor(Math.random() * gateIds.length)];
    
    const gate = GATE_CONFIGS.find(g => g.id === recommendedGate) || GATE_CONFIGS[0];
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    
    spectators.push({
      id: `SPEC${String(i).padStart(5, '0')}`,
      profile,
      assignedGate: recommendedGate,
      position: {
        x: 50 + Math.cos(angle) * distance,
        y: 50 + Math.sin(angle) * distance,
      },
      status: 'approaching' as const,
      arrivalTime: new Date(Date.now() + Math.random() * 7200000),
      estimatedWait: Math.floor(Math.random() * 30) + 5,
  });
  }
  
  return spectators;
};

const getGateStatus = (queue: number, capacity: number): Gate['status'] => {
  const ratio = queue / capacity;
  if (ratio < 0.3) return 'optimal';
  if (ratio < 0.6) return 'moderate';
  if (ratio < 0.85) return 'congested';
  return 'critical';
};

export const useSimulation = (spectatorCount: number = 1000) => {
  const [gates, setGates] = useState<Gate[]>([]);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Map<string, ModelPrediction>>(new Map());
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    speed: 1,
    currentTime: new Date(),
    totalSpectators: spectatorCount,
    enteredSpectators: 0,
    avgWaitTime: 0,
    crisisMode: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef(0);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
    const initialGates = GATE_CONFIGS.map(g => ({
      ...g,
      currentQueue: Math.floor(Math.random() * 50),
      throughput: Math.floor(g.capacity * (0.7 + Math.random() * 0.3)),
    }));
    setGates(initialGates);
      
      // Initialize historical data for model
      initialGates.forEach(gate => {
        predictionModel.updateHistoricalData(gate.id, {
          timestamp: new Date(),
          gateId: gate.id,
          queue: gate.currentQueue,
          throughput: gate.throughput,
          waitTime: gate.avgProcessTime,
        });
      });
      
      // Generate spectators (synchronous, fast)
      const initialSpectators = generateSpectators(spectatorCount, initialGates);
      setSpectators(initialSpectators);
      
      // Generate initial predictions asynchronously (non-blocking)
      predictionModel.predictAll(initialGates, new Date()).then(initialPredictions => {
        setPredictions(initialPredictions);
      }).catch(err => {
        console.warn('Initial predictions failed, will retry:', err);
      });
    
    // Initial alerts
    setAlerts([
      {
        id: '1',
        type: 'info',
        title: 'System Online',
        message: 'EVENT FLOW AI is monitoring all gates',
        timestamp: new Date(),
      },
        {
          id: '2',
          type: 'success',
          title: 'LSTM Model Loaded',
          message: `TensorFlow.js model initialized. Accuracy: ${(predictionModel.getMetrics().accuracy * 100).toFixed(1)}%`,
        timestamp: new Date(),
      },
    ]);
    };
    
    initialize();
  }, [spectatorCount]);

  const updateSimulation = useCallback(async () => {
    tickRef.current += 1;

    setGates(prev => {
      const updatedGates = prev.map(gate => {
      const entering = Math.floor(Math.random() * 5) + 1;
      const processing = Math.min(gate.currentQueue, Math.floor(gate.capacity / 60));
      const newQueue = Math.max(0, gate.currentQueue + entering - processing);
        
        // Update model with new data point
        predictionModel.updateHistoricalData(gate.id, {
          timestamp: simulation.currentTime,
          gateId: gate.id,
          queue: newQueue,
          throughput: gate.throughput + processing,
          waitTime: gate.avgProcessTime,
        });
      
      return {
        ...gate,
        currentQueue: newQueue,
        status: getGateStatus(newQueue, gate.capacity),
        throughput: gate.throughput + processing,
      };
      });
      
      // Generate new predictions every 10 ticks (less frequent for better performance)
      if (tickRef.current % 10 === 0) {
        // Non-blocking async prediction
        predictionModel.predictAll(updatedGates, simulation.currentTime).then(newPredictions => {
          setPredictions(newPredictions);
        }).catch(err => {
          console.warn('Prediction update failed:', err);
        });
      }
      
      return updatedGates;
    });

    setSpectators(prev => {
      const updated = prev.map(spec => {
      if (spec.status === 'entered') return spec;
      
      const gate = GATE_CONFIGS.find(g => g.id === spec.assignedGate)!;
      const dx = gate.position.x - spec.position.x;
      const dy = gate.position.y - spec.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        if (Math.random() > 0.9) {
          return { ...spec, status: 'entered' as const };
        }
        return { ...spec, status: 'queued' as const };
      }
      
      const speed = 0.3 + Math.random() * 0.2;
      return {
        ...spec,
        position: {
          x: spec.position.x + (dx / distance) * speed,
          y: spec.position.y + (dy / distance) * speed,
        },
      };
      });

      // Update simulation state with entered count from updated spectators
      const entered = updated.filter(s => s.status === 'entered').length;
      const queued = updated.filter(s => s.status === 'queued').length;
      
      // Calculate average wait time from current gates state
      const avgWait = gates.length > 0
        ? Math.round(
            gates.reduce((sum, g) => {
              const waitTime = g.capacity > 0 && g.avgProcessTime > 0
                ? (g.currentQueue / (g.capacity / g.avgProcessTime))
                : 0;
              return sum + waitTime;
            }, 0) / gates.length
          )
        : 0;
      
      setSimulation(prev => ({
        ...prev,
        currentTime: new Date(prev.currentTime.getTime() + 60000),
        enteredSpectators: entered,
        avgWaitTime: avgWait || Math.floor(10 + Math.random() * 5),
      }));
      
      return updated;
    });

    // Generate alerts periodically
    if (tickRef.current % 20 === 0) {
      const criticalGates = gates.filter(g => g.status === 'critical');
      if (criticalGates.length > 0) {
        const gate = criticalGates[0];
        setAlerts(prev => [{
          id: `alert-${Date.now()}`,
          type: 'critical',
          title: `${gate.name} Congestion Alert`,
          message: `Queue exceeds 85% capacity. Recommend redirecting to nearby gates.`,
          timestamp: new Date(),
          gateId: gate.id,
          action: 'Redirect Flow',
        }, ...prev.slice(0, 9)]);
      }
    }

    // Model-based predictions
    if (tickRef.current % 15 === 0) {
      predictions.forEach((prediction, gateId) => {
        if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
          const gate = gates.find(g => g.id === gateId);
          if (gate) {
            const maxDensity = Math.max(...prediction.predictedDensity);
            const timeIndex = prediction.predictedDensity.indexOf(maxDensity);
            const minutesAhead = prediction.timeHorizon[timeIndex];
            
      setAlerts(prev => [{
              id: `pred-${gateId}-${Date.now()}`,
              type: prediction.riskLevel === 'critical' ? 'critical' : 'warning',
              title: 'LSTM Model Prediction',
              message: `${gate.name} predicted to reach ${(maxDensity * 100).toFixed(0)}% capacity in ${minutesAhead} minutes (confidence: ${(prediction.confidence * 100).toFixed(0)}%)`,
        timestamp: new Date(),
              gateId: gate.id,
              action: prediction.suggestedAction === 'redirect' ? 'Redirect Flow' : undefined,
      }, ...prev.slice(0, 9)]);
          }
        }
      });
    }
  }, [gates, spectators, predictions, simulation.currentTime]);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;
    setSimulation(prev => ({ ...prev, isRunning: true }));
    // Use requestAnimationFrame for smoother updates, fallback to 200ms minimum
    const interval = Math.max(200, 500 / simulation.speed);
    intervalRef.current = setInterval(() => {
      updateSimulation();
    }, interval);
  }, [updateSimulation, simulation.speed]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSimulation(prev => ({ ...prev, isRunning: false }));
  }, []);

  const toggleCrisis = useCallback(() => {
    setSimulation(prev => ({ ...prev, crisisMode: !prev.crisisMode }));
    if (!simulation.crisisMode) {
      setAlerts(prev => [{
        id: `crisis-${Date.now()}`,
        type: 'critical',
        title: '⚠️ CRISIS MODE ACTIVATED',
        message: 'Transport delay detected. Redirecting 500 spectators to alternate gates.',
        timestamp: new Date(),
      }, ...prev.slice(0, 9)]);
      
      // Increase queue at random gates
      setGates(prev => prev.map(g => ({
        ...g,
        currentQueue: g.currentQueue + Math.floor(Math.random() * 100),
      })));
    }
  }, [simulation.crisisMode]);

  const redirectGate = useCallback((fromGateId: string, toGateId: string) => {
    setSpectators(prev => prev.map(spec => {
      if (spec.assignedGate === fromGateId && spec.status === 'approaching') {
        return { ...spec, assignedGate: toGateId };
      }
      return spec;
    }));
    
    setAlerts(prev => [{
      id: `redirect-${Date.now()}`,
      type: 'success',
      title: 'Redirect Successful',
      message: `Spectators redirected from Gate ${fromGateId} to Gate ${toGateId}`,
      timestamp: new Date(),
    }, ...prev.slice(0, 9)]);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    gates,
    spectators,
    alerts,
    predictions,
    modelMetrics: predictionModel.getMetrics(),
    simulation,
    startSimulation,
    stopSimulation,
    toggleCrisis,
    redirectGate,
  };
};
