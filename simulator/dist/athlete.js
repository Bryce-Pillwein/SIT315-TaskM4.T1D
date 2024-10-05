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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const mqtt_1 = __importDefault(require("mqtt"));
const uuid_1 = require("uuid");
const athleteConstructors_1 = require("./utils/athleteConstructors");
const config_1 = require("./config");
const roundToTwo_1 = __importDefault(require("./utils/roundToTwo"));
class Athlete {
    constructor() {
        this.id = `athlete-${(0, uuid_1.v4)()}`;
        this.athleteData = this.initializeAthleteData();
        this.location = this.initializeLocation();
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'fitness-tracker',
            brokers: config_1.KAFKA_BROKERS,
        });
        this.producer = this.kafka.producer();
        this.mqttClient = mqtt_1.default.connect(config_1.MQTT_BROKER_URL);
        // Initialize direction and persistence variables
        this.currentDirection = this.randomDirection();
        this.updatesInSameDirection = 0;
    }
    /**
     * Loop for Updating Data
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.connect();
            this.mqttClient.on('connect', () => {
                console.log(`Athlete ${this.athleteData.name} connected to MQTT broker`);
                setInterval(() => {
                    // Calculate distance once and use it in both updates
                    const distance = (0, roundToTwo_1.default)(Math.random() * (30 - 15) + 15); // Random distance between 15 and 30 meters
                    // Update location with persistent direction for more human-like movement
                    this.location = this.updateLocation(this.location, distance);
                    // Update athlete data
                    this.updateAthleteData(distance);
                    // Publish data to MQTT and Kafka
                    this.publishGPSData();
                    this.publishFitnessData();
                }, 5000); // Data updates every 5 seconds
            });
        });
    }
    /**
     * Initialise Athlete Data
     * @returns {AthleteData} Athlete Data
     */
    initializeAthleteData() {
        const name = (0, athleteConstructors_1.generateRandomName)();
        const age = (0, athleteConstructors_1.generateAge)();
        const weight = (0, athleteConstructors_1.generateWeight)();
        const gender = (0, athleteConstructors_1.generateSex)();
        const maxHeartRate = (0, athleteConstructors_1.calculateMaxHeartRate)(age);
        const initialHeartRate = (0, roundToTwo_1.default)(Math.random() * (100 - 60) + 60); // Start heart rate between 60 and 100 BPM
        return {
            athleteId: this.id,
            name,
            age,
            weight,
            gender,
            heartRate: initialHeartRate,
            totalDistance: 0,
            elevationGain: 0,
            maxHeartRate,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Initialise Location
     * @returns {Location} Location
     */
    initializeLocation() {
        return {
            lat: -37.84984, // Starting latitude
            lon: 145.11455, // Starting longitude
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Generate a random but fixed direction (lat, lon)
     * @returns {lat: number, lon: number}
     */
    randomDirection() {
        const latDirection = Math.random() > 0.5 ? 1 : -1;
        const lonDirection = Math.random() > 0.5 ? 1 : -1;
        return { lat: latDirection, lon: lonDirection };
    }
    /**
     * Update Athlete Data
     * @param distance The distance to update for athlete
     */
    updateAthleteData(distance) {
        const speedModifier = this.calculateSpeedModifier(distance); // Calculate speed-based modifier
        this.athleteData.totalDistance += distance;
        this.athleteData.totalDistance = (0, roundToTwo_1.default)(this.athleteData.totalDistance);
        this.athleteData.heartRate = (0, roundToTwo_1.default)(this.updateHeartRate(this.athleteData.heartRate, speedModifier));
        this.athleteData.elevationGain += (0, roundToTwo_1.default)(Math.random() > 0.9 ? Math.floor(Math.random() * 5 + 1) : 0);
        this.athleteData.timestamp = new Date().toISOString();
    }
    /**
     * Update Heart Rate with a speed modifier
     * @param currentHeartRate
     * @param speedModifier
     * @returns
     */
    updateHeartRate(currentHeartRate, speedModifier) {
        // Heart rate should gradually approach 60% to 90% of the max heart rate
        const { maxHeartRate } = this.athleteData;
        const minHeartRate = maxHeartRate * 0.6;
        const maxTargetHeartRate = maxHeartRate * 0.9;
        const increase = Math.random() < 0.5 ? 1 : -1;
        const variation = increase * (Math.random() * 2 + 1) * speedModifier; // Use speedModifier to affect the heart rate
        let newHeartRate = currentHeartRate + variation;
        // Ensure the heart rate gradually increases towards the 60%-90% range
        if (newHeartRate < minHeartRate) {
            newHeartRate = Math.min(newHeartRate + 2, minHeartRate); // Encourage gradual increase
        }
        else if (newHeartRate > maxTargetHeartRate) {
            newHeartRate = Math.max(newHeartRate - 2, maxTargetHeartRate); // Prevent exceeding the max
        }
        return newHeartRate;
    }
    /**
     * Calculate speed modifier based on the distance
     * @param distance
     * @returns Speed Modifier
     */
    calculateSpeedModifier(distance) {
        const baseDistance = 10; // Base distance to normalize speed
        return distance / baseDistance; // The faster the athlete moves, the higher the modifier
    }
    /**
     * Update Location with persistent direction
     * @param currentLocation
     * @param distance The distance to use for location update
     * @returns {Location}
     */
    updateLocation(currentLocation, distance) {
        // Change direction every 10 updates (or after traveling a certain distance)
        if (this.updatesInSameDirection >= 50) {
            this.currentDirection = this.randomDirection(); // Change direction
            this.updatesInSameDirection = 0; // Reset counter
        }
        const latMove = this.currentDirection.lat * (distance / 111000); // Approximate conversion meters to degrees
        const lonMove = this.currentDirection.lon * (distance / (111000 * Math.cos(currentLocation.lat * (Math.PI / 180))));
        this.updatesInSameDirection += 1;
        return {
            lat: Math.round((currentLocation.lat + latMove) * 100000) / 100000,
            lon: Math.round((currentLocation.lon + lonMove) * 100000) / 100000,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Publish Fitness Data
     */
    publishFitnessData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fitnessData = Object.assign({}, this.athleteData);
                yield this.producer.send({
                    topic: config_1.FITNESS_DATA_TOPIC,
                    messages: [{ value: JSON.stringify(fitnessData) }],
                });
                console.log(`Fitness data published to Kafka from ${this.athleteData.name}:`);
            }
            catch (error) {
                console.error(`Failed to publish fitness data from ${this.athleteData.name}:`, error);
            }
        });
    }
    /**
     * Publish GPS Data
     */
    publishGPSData() {
        try {
            const gpsTopic = `athlete/${this.id}/gps`;
            this.mqttClient.publish(gpsTopic, JSON.stringify(this.location), { qos: 0 }, (error) => {
                if (error) {
                    console.error(`Failed to publish GPS data to MQTT from ${this.athleteData.name}:`, error);
                }
                else {
                    console.log(`GPS data published to MQTT from ${this.athleteData.name}`);
                }
            });
        }
        catch (error) {
            console.error(`Failed to publish GPS data from ${this.athleteData.name}:`, error);
        }
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Shutting down athlete ${this.athleteData.name}`);
            yield this.producer.disconnect();
            this.mqttClient.end();
        });
    }
}
exports.default = Athlete;
