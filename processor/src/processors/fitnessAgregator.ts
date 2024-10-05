import { setAthleteData } from "../services/setAtheleteData";
import { AthleteData } from "../types/AthleteData";
import { FitnessMessage } from "../types/FitnessMessage";

const aggregationMap: Record<string, any> = {};

/**
 * Process Fitness Data.
 * This function is called every 5 seconds by Kafka Process.
 * @param fitnessData
 */
export function processFitnessData(fitnessData: FitnessMessage) {
  const athleteId = fitnessData.athleteId;

  // Merge initialization and update into a single step
  aggregationMap[athleteId] = {
    heartRateSum: (aggregationMap[athleteId]?.heartRateSum || 0) + fitnessData.heartRate,
    dataCount: (aggregationMap[athleteId]?.dataCount || 0) + 1,
    totalDistance: fitnessData.totalDistance,
    elevationGain: fitnessData.elevationGain,
    startTime: aggregationMap[athleteId]?.startTime || new Date(fitnessData.timestamp), // Keep existing startTime or initialize
    weight: fitnessData.weight || aggregationMap[athleteId]?.weight || 70, // Keep weight or use default
  };

  // Save the aggregated data every 6 messages (30 seconds)
  if (aggregationMap[athleteId].dataCount >= 6) {
    saveAggregatedData(athleteId, fitnessData);
  }
}

/**
 * Save aggregated fitness data to Firestore
 * @param athleteId
 * @param fitnessData
 */
async function saveAggregatedData(athleteId: string, fitnessData: FitnessMessage) {
  const athleteData = aggregationMap[athleteId];
  const avgHeartRate = athleteData.heartRateSum / athleteData.dataCount;
  const timeDiff = (new Date().getTime() - athleteData.startTime.getTime()) / 1000; // Time difference in seconds
  const calories = calculateCalories(timeDiff, athleteData.weight);

  const aggregatedData: AthleteData = {
    athleteId,
    name: fitnessData.name,
    age: fitnessData.age,
    gender: fitnessData.gender,
    heartRate: avgHeartRate,
    maxHeartRate: fitnessData.maxHeartRate,
    totalDistance: parseFloat(athleteData.totalDistance.toFixed(2)),
    elevationGain: parseFloat(athleteData.elevationGain.toFixed(2)),
    timestamp: new Date().toISOString(), // Current timestamp
    startTime: athleteData.startTime, // Preserve the start time
    weight: athleteData.weight,
    totalCalories: Math.round(calories * 100) / 100,
  };

  await setAthleteData(aggregatedData);
  console.log(`Aggregated fitness data saved for ${athleteId}`);

  // Reset data count and heart rate sum after saving
  aggregationMap[athleteId].dataCount = 0;
  aggregationMap[athleteId].heartRateSum = 0;
}

/**
 * Calculate calories burned
 * @param timeDiff
 * @param weight
 */
function calculateCalories(timeDiff: number, weight: number) {
  const MET = 8; // Assumed MET for running
  return (weight * MET * timeDiff) / 3600; // Calories burned during the time interval
}
