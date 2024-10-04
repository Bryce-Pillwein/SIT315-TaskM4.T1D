/**
 * Athlete Data
 */
export interface AthleteData {
  athleteId: string;
  name: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  heartRate: number;
  maxHeartRate: number;
  totalDistance: number;
  elevationGain: number;
  pace?: number,
  totalCalories?: number;
  timestamp: string;
  startTime: Date;
}