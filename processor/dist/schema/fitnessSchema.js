"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fitnessSchema = new mongoose_1.default.Schema({
    athleteId: {
        type: String,
        required: true,
    },
    avgHeartRate: {
        type: String,
        required: true,
    },
    totalDistance: {
        type: String,
        required: true,
    },
    totalCalories: {
        type: Number,
        required: true,
    },
    elevationGain: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
});
const FitnessData = mongoose_1.default.model('FitnessData', fitnessSchema);
exports.default = FitnessData;
