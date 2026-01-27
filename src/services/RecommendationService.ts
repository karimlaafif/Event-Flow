import type { Gate } from '@/types/event-flow';

interface GatePosition {
  id: string;
  x: number;
  y: number;
}

export interface PathRecommendation {
  gateId: string;
  gateName: string;
  distance: number;
  estimatedTime: number;
  waitTime: number;
  totalTime: number;
  path: string[];
}

/**
 * Calculate shortest path using Dijkstra's algorithm
 */
export class RecommendationService {
  private gatePositions: Map<string, GatePosition> = new Map();
  private gateConnections: Map<string, string[]> = new Map();

  constructor() {
    // Initialize gate positions (stadium layout)
    this.gatePositions.set('A', { id: 'A', x: 50, y: 10 });
    this.gatePositions.set('B', { id: 'B', x: 85, y: 25 });
    this.gatePositions.set('C', { id: 'C', x: 85, y: 75 });
    this.gatePositions.set('D', { id: 'D', x: 50, y: 90 });
    this.gatePositions.set('E', { id: 'E', x: 15, y: 75 });
    this.gatePositions.set('F', { id: 'F', x: 15, y: 25 });

    // Define connections between gates (walking paths)
    this.gateConnections.set('A', ['B', 'F']);
    this.gateConnections.set('B', ['A', 'C']);
    this.gateConnections.set('C', ['B', 'D']);
    this.gateConnections.set('D', ['C', 'E']);
    this.gateConnections.set('E', ['D', 'F']);
    this.gateConnections.set('F', ['E', 'A']);
  }

  /**
   * Calculate Euclidean distance between two gates
   */
  private calculateDistance(gate1: GatePosition, gate2: GatePosition): number {
    const dx = gate2.x - gate1.x;
    const dy = gate2.y - gate1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Find shortest path using Dijkstra's algorithm
   */
  findShortestPath(
    startGateId: string,
    targetGateId: string,
    gates: Gate[]
  ): PathRecommendation | null {
    const start = this.gatePositions.get(startGateId);
    const target = this.gatePositions.get(targetGateId);

    if (!start || !target) return null;

    // If same gate, return direct path
    if (startGateId === targetGateId) {
      const gate = gates.find(g => g.id === targetGateId);
      return {
        gateId: targetGateId,
        gateName: gate?.name || `Gate ${targetGateId}`,
        distance: 0,
        estimatedTime: 0,
        waitTime: gate ? (gate.currentQueue / (gate.capacity / gate.avgProcessTime)) : 0,
        totalTime: gate ? (gate.currentQueue / (gate.capacity / gate.avgProcessTime)) : 0,
        path: [targetGateId],
      };
    }

    // Dijkstra's algorithm
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    this.gatePositions.forEach((_, id) => {
      distances.set(id, Infinity);
      previous.set(id, null);
      unvisited.add(id);
    });

    distances.set(startGateId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(id => {
        const dist = distances.get(id) || Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          current = id;
        }
      });

      if (!current || current === targetGateId) break;

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = this.gateConnections.get(current) || [];
      neighbors.forEach(neighbor => {
        if (!unvisited.has(neighbor)) return;

        const currentPos = this.gatePositions.get(current!);
        const neighborPos = this.gatePositions.get(neighbor);
        if (!currentPos || !neighborPos) return;

        const alt = (distances.get(current!) || 0) + this.calculateDistance(currentPos, neighborPos);
        if (alt < (distances.get(neighbor) || Infinity)) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = targetGateId;
    while (current) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    const targetGate = gates.find(g => g.id === targetGateId);
    const distance = distances.get(targetGateId) || 0;
    const walkingSpeed = 5; // units per minute (normal walking speed)
    const estimatedTime = distance / walkingSpeed;
    const waitTime = targetGate ? (targetGate.currentQueue / (targetGate.capacity / targetGate.avgProcessTime)) : 0;

    return {
      gateId: targetGateId,
      gateName: targetGate?.name || `Gate ${targetGateId}`,
      distance: Math.round(distance * 10) / 10,
      estimatedTime: Math.round(estimatedTime * 10) / 10,
      waitTime: Math.round(waitTime * 10) / 10,
      totalTime: Math.round((estimatedTime + waitTime) * 10) / 10,
      path,
    };
  }

  /**
   * Recommend best gate based on current position and gate status
   */
  recommendBestGate(
    currentPosition: { x: number; y: number },
    gates: Gate[]
  ): PathRecommendation[] {
    // Find nearest gate to current position
    let nearestGateId = 'A';
    let minDist = Infinity;

    this.gatePositions.forEach((pos, id) => {
      const dx = pos.x - currentPosition.x;
      const dy = pos.y - currentPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearestGateId = id;
      }
    });

    // Calculate paths to all gates and sort by total time
    const recommendations: PathRecommendation[] = gates
      .map(gate => this.findShortestPath(nearestGateId, gate.id, gates))
      .filter((rec): rec is PathRecommendation => rec !== null)
      .sort((a, b) => a.totalTime - b.totalTime);

    return recommendations;
  }
}

export const recommendationService = new RecommendationService();

