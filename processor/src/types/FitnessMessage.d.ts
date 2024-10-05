/**
 * Fitness Message
 */
export interface FitnessMessage {
  athleteId: string;
  name: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  heartRate: number;
  maxHeartRate: number;
  totalDistance: number;
  elevationGain: number;
  totalCalories?: number;
  timestamp: string;
}