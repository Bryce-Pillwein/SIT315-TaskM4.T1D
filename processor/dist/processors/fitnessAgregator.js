"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFitnessData = processFitnessData;
const setAtheleteData_1 = require("../services/setAtheleteData");
const aggregationMap = {};
/**
 * Initialize aggregation data for an athlete
 * @param fitnessData
 */
function initializeAggregation(athleteId, fitnessData) {
    aggregationMap[athleteId] = {
        heartRateSum: fitnessData.heartRate,
        dataCount: 1,
        totalDistance: fitnessData.totalDistance,
        elevationGain: fitnessData.elevationGain,
        startTime: new Date(fitnessData.timestamp), // Save the first timestamp as startTime
        weight: fitnessData.weight || 70 // Default weight if not provided
    };
}
/**
 * Update aggregation data for an athlete
 * @param athleteId
 * @param fitnessData
 */
function updateAggregation(athleteId, fitnessData) {
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
function calculateMetrics(totalDistance, timeDiff, weight) {
    // Calculate pace (in minutes per kilometer)
    const totalTimeInMinutes = timeDiff / 60;
    const pace = totalDistance > 0 ? totalTimeInMinutes / totalDistance : 0;
    // Estimate calories burned (example formula: weight * MET * time / 60)
    const MET = 8; // Assumed MET for running
    const caloriesBurned = weight * MET * (timeDiff / 3600); // calories burned in the time interval
    return { pace, caloriesBurned };
}
/**
 * Save aggregated fitness data to Firestore
 * @param athleteId
 * @param fitnessData
 * @param avgHeartRate
 * @param metrics
 */
function saveAggregatedData(athleteId, fitnessData, avgHeartRate, metrics) {
    return __awaiter(this, void 0, void 0, function* () {
        const aggregatedData = {
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
        const enrichedData = Object.assign(Object.assign({}, aggregatedData), { pace: Math.round(metrics.pace * 100) / 100, totalCalories: Math.round(metrics.caloriesBurned * 100) / 100 });
        // Pass all fields including age and gender to the `setAthleteData` function
        yield (0, setAtheleteData_1.setAthleteData)(enrichedData);
        console.log(`Aggregated fitness data saved for ${athleteId}`);
    });
}
/**
 * Process Fitness Data
 * @param fitnessData
 */
function processFitnessData(fitnessData) {
    return __awaiter(this, void 0, void 0, function* () {
        const athleteId = fitnessData.athleteId;
        try {
            if (!aggregationMap[athleteId]) {
                // Initialize aggregation using the first timestamp as startTime
                initializeAggregation(athleteId, fitnessData);
            }
            else {
                // Update aggregation
                updateAggregation(athleteId, fitnessData);
            }
            const athleteData = aggregationMap[athleteId];
            const currentTime = new Date(fitnessData.timestamp); // Use current data timestamp for calculations
            const timeDiff = (currentTime.getTime() - athleteData.startTime.getTime()) / 1000; // Time difference in seconds
            // If 30 seconds have passed, calculate pace and calories
            if (timeDiff >= 30) {
                const avgHeartRate = athleteData.heartRateSum / athleteData.dataCount;
                const metrics = calculateMetrics(athleteData.totalDistance, timeDiff, athleteData.weight);
                // Only save pace in the latest data, and continue processing
                yield saveAggregatedData(athleteId, fitnessData, avgHeartRate, metrics);
                // Reset aggregation data but preserve startTime
                aggregationMap[athleteId].startTime = athleteData.startTime; // Keep the original start time
                initializeAggregation(athleteId, fitnessData);
            }
        }
        catch (error) {
            console.error(`Error processing fitness data for athlete ${athleteId}:`, error);
        }
    });
}
