import { db } from "../config/firebaseConfig";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { AthleteData } from "../types/AthleteData";


/**
 * Set Athlete Data
 * @param athleteData 
 */
export async function setAthleteData(athleteData: AthleteData) {

  try {
    if (!athleteData.athleteId || typeof athleteData.athleteId !== 'string') {
      throw new Error('Invalid athleteId provided.');
    }

    // Update or merge the latest data in `latestFitnessData`
    const latestDataDoc = doc(db, 'latestFitnessData', athleteData.athleteId);
    await setDoc(latestDataDoc, {
      athleteId: athleteData.athleteId,
      name: athleteData.name,
      age: athleteData.age,
      gender: athleteData.gender,
      heartRate: athleteData.heartRate,
      totalDistance: athleteData.totalDistance,
      elevationGain: athleteData.elevationGain,
      totalCalories: athleteData.totalCalories,
      timestamp: athleteData.timestamp,
      startTime: athleteData.startTime
    }, { merge: true });

    // Append new data to `historicalFitnessData`
    const historicalDataCol = collection(db, 'historicalFitnessData');
    await addDoc(historicalDataCol, {
      athleteId: athleteData.athleteId,
      name: athleteData.name,
      heartRate: athleteData.heartRate,
      totalDistance: athleteData.totalDistance,
      elevationGain: athleteData.elevationGain,
      totalCalories: athleteData.totalCalories,
      timestamp: athleteData.timestamp
    });

  } catch (error) {
    console.error("Error setting athlete data: ", error);
    throw error;
  }
}
