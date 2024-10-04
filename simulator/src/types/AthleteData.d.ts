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
  timestamp: string;
}