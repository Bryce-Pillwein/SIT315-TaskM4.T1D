import { setAthleteData } from "../services/setAtheleteData";
import { AthleteData } from "../types/AthleteData"; // Use the new AthleteData type
import { FitnessMessage } from "../types/FitnessMessage";

const aggregationMap: Record<string, any> = {};


/**
 * Initialize aggregation data for an athlete
 * @param athleteId 
 * @param fitnessData 
 * @param preserveStartTime 
 */
function initializeAggregation(athleteId: string, fitnessData: FitnessMessage, preserveStartTime?: boolean) {
  aggregationMap[athleteId] = {
    heartRateSum: fitnessData.heartRate,
    dataCount: 1,
    totalDistance: fitnessData.totalDistance,
    elevationGain: fitnessData.elevationGain,
    startTime: preserveStartTime ? aggregationMap[athleteId].startTime : new Date(fitnessData.timestamp), // Preserve existing startTime
    weight: fitnessData.weight || 70, // Default weight if not provided
  };
}


/**
 * Update aggregation data for an athlete
 * @param athleteId 
 * @param fitnessData 
 */
function updateAggregation(athleteId: string, fitnessData: FitnessMessage) {
  const athleteData = aggregationMap[athleteId];
  athleteData.heartRateSum += fitnessData.heartRate;
  athleteData.dataCount += 1;
  athleteData.totalDistance = fitnessData.totalDistance;
  athleteData.elevationGain = fitnessData.elevationGain;
  athleteData.weight = fitnessData.weight || athleteData.weight; // Update weight if available
}

/**
 * Calculate pace and calories burned
 * @param totalDistance 
 * @param timeDiff 
 * @param weight 
 */
function calculateCalories(timeDiff: number, weight: number) {
  // Estimate calories burned (example formula: weight * MET * time / 60)
  const MET = 8; // Assumed MET for running
  const caloriesBurned = weight * MET * (timeDiff / 3600); // calories burned in the time interval

  return caloriesBurned;
}

/**
 * Save aggregated fitness data to Firestore
 * @param athleteId 
 * @param fitnessData 
 * @param avgHeartRate 
 * @param metrics 
 */
async function saveAggregatedData(athleteId: string, fitnessData: FitnessMessage, avgHeartRate: number, caloriesBurned: number) {

  const aggregatedData: AthleteData = {
    athleteId,
    name: fitnessData.name,
    age: fitnessData.age, // Passing age
    gender: fitnessData.gender, // Passing gender
    heartRate: avgHeartRate,
    maxHeartRate: fitnessData.maxHeartRate,
    totalDistance: parseFloat(aggregationMap[athleteId].totalDistance.toFixed(2)),
    elevationGain: parseFloat(aggregationMap[athleteId].elevationGain.toFixed(2)),
    timestamp: new Date().toISOString(), // Updated timestamp for the current entry
    startTime: aggregationMap[athleteId].startTime, // Keep the original startTime
    weight: aggregationMap[athleteId].weight,
  };

  // Add calculated pace and calories burned to aggregated data
  const enrichedData = {
    ...aggregatedData,
    totalCalories: Math.round(caloriesBurned * 100) / 100,
  };

  // Pass all fields including age and gender to the `setAthleteData` function
  await setAthleteData(enrichedData);
  console.log(`Aggregated fitness data saved for ${athleteId}`);
}

/**
 * Process Fitness Data
 * @param fitnessData 
 */
export async function processFitnessData(fitnessData: FitnessMessage) {
  const athleteId = fitnessData.athleteId;

  try {
    if (!aggregationMap[athleteId]) {
      // Initialize aggregation using the first timestamp as startTime
      initializeAggregation(athleteId, fitnessData);
    } else {
      // Update aggregation
      updateAggregation(athleteId, fitnessData);
    }

    const athleteData = aggregationMap[athleteId];
    const currentTime = new Date(fitnessData.timestamp); // Use current data timestamp for calculations
    const timeDiff = (currentTime.getTime() - athleteData.startTime.getTime()) / 1000; // Time difference in seconds

    // If 30 seconds have passed, calculate pace and calories
    if (timeDiff >= 30) {
      const avgHeartRate = athleteData.heartRateSum / athleteData.dataCount;
      const calories = calculateCalories(timeDiff, athleteData.weight);

      // Only save pace in the latest data, and continue processing
      /**
       * 
       * 
       * CHANGE
       */
      // await saveAggregatedData(athleteId, fitnessData, avgHeartRate, calories);

      // Reset aggregation data but preserve the original startTime
      initializeAggregation(athleteId, fitnessData, true); // Pass `true` to preserve startTime
    }
  } catch (error) {
    console.error(`Error processing fitness data for athlete ${athleteId}:`, error);
  }
}

