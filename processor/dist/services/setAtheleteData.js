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
exports.setAthleteData = setAthleteData;
const firebaseConfig_1 = require("../config/firebaseConfig");
const firestore_1 = require("firebase/firestore");
/**
 * Set Athlete Data
 * @param athleteData
 */
function setAthleteData(athleteData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!athleteData.athleteId || typeof athleteData.athleteId !== 'string') {
                throw new Error('Invalid athleteId provided.');
            }
            // Update or merge the latest data in `latestFitnessData`
            const latestDataDoc = (0, firestore_1.doc)(firebaseConfig_1.db, 'latestFitnessData', athleteData.athleteId);
            yield (0, firestore_1.setDoc)(latestDataDoc, {
                athleteId: athleteData.athleteId,
                name: athleteData.name,
                age: athleteData.age,
                gender: athleteData.gender,
                heartRate: athleteData.heartRate,
                totalDistance: athleteData.totalDistance,
                elevationGain: athleteData.elevationGain,
                pace: athleteData.pace,
                totalCalories: athleteData.totalCalories,
                timestamp: athleteData.timestamp
            }, { merge: true });
            // Append new data to `historicalFitnessData`
            const historicalDataCol = (0, firestore_1.collection)(firebaseConfig_1.db, 'historicalFitnessData');
            yield (0, firestore_1.addDoc)(historicalDataCol, {
                athleteId: athleteData.athleteId,
                name: athleteData.name,
                heartRate: athleteData.heartRate,
                totalDistance: athleteData.totalDistance,
                elevationGain: athleteData.elevationGain,
                pace: athleteData.pace,
                totalCalories: athleteData.totalCalories,
                timestamp: athleteData.timestamp
            });
            console.log(`Data for athlete ${athleteData.athleteId} updated successfully.`);
        }
        catch (error) {
            console.error("Error setting athlete data: ", error);
            throw error;
        }
    });
}
