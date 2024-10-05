import { Kafka, Producer } from 'kafkajs';
import mqtt, { MqttClient } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { AthleteData } from './types/AthleteData';
import { Location } from './types/Location';
import { calculateMaxHeartRate, generateAge, generateRandomName, generateSex, generateWeight } from './utils/athleteConstructors';
import roundToTwo from './utils/roundToTwo';

class Athlete {
  id: string;
  athleteData: AthleteData;
  location: Location;
  kafka: Kafka;
  producer: Producer;
  mqttClient: MqttClient;
  currentDirection: { lat: number; lon: number };
  updatesInSameDirection: number;
  updateInterval: NodeJS.Timeout | null = null;

  constructor(athleteIndex: number) {
    this.id = `athlete-${athleteIndex}`; // Use athleteIndex to create a unique athlete ID
    this.athleteData = this.initializeAthleteData(athleteIndex); // Pass index if necessary for data
    this.location = this.initializeLocation();

    this.kafka = new Kafka({
      clientId: 'fitness-tracker',
      brokers: ['kafka:9092'],
    });

    this.producer = this.kafka.producer();
    this.mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

    this.currentDirection = this.randomDirection();
    this.updatesInSameDirection = 0;
  }

  /**
   * Loop for Updating Data
   */
  async start() {
    await this.producer.connect();

    this.mqttClient.on('connect', () => {
      console.log(`Athlete ${this.athleteData.name} connected to MQTT broker`);

      this.updateInterval = setInterval(() => {
        const distance = roundToTwo(Math.random() * (30 - 15) + 15);

        this.location = this.updateLocation(this.location, distance);
        this.updateAthleteData(distance);

        this.publishGPSData();
        this.publishFitnessData();
      }, 5000);
    });
  }

  /**
   * Initialize Athlete Data
   * @param athleteIndex
   * @returns {AthleteData} Athlete Data
   */
  initializeAthleteData(athleteIndex: number): AthleteData {
    const name = generateRandomName();
    const age = generateAge();
    const weight = generateWeight();
    const gender = generateSex();
    const maxHeartRate = calculateMaxHeartRate(age);
    const initialHeartRate = roundToTwo(Math.random() * (100 - 60) + 60); // Start HR btwn 60 - 100 BPM

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
  initializeLocation(): Location {
    return {
      lat: -37.84984, // Starting latitude
      lon: 145.11455,  // Starting longitude
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
  updateAthleteData(distance: number) {
    const speedModifier = this.calculateSpeedModifier(distance); // Calculate speed-based modifier

    this.athleteData.totalDistance += distance;
    this.athleteData.totalDistance = roundToTwo(this.athleteData.totalDistance);

    this.athleteData.heartRate = roundToTwo(this.updateHeartRate(this.athleteData.heartRate, speedModifier));
    this.athleteData.elevationGain += roundToTwo(Math.random() > 0.9 ? Math.floor(Math.random() * 5 + 1) : 0);
    this.athleteData.timestamp = new Date().toISOString();
  }

  /**
   * Update Heart Rate with a speed modifier
   * @param currentHeartRate 
   * @param speedModifier 
   * @returns 
   */
  updateHeartRate(currentHeartRate: number, speedModifier: number): number {
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
    } else if (newHeartRate > maxTargetHeartRate) {
      newHeartRate = Math.max(newHeartRate - 2, maxTargetHeartRate); // Prevent exceeding the max
    }

    return newHeartRate;
  }

  /**
   * Calculate speed modifier based on the distance
   * @param distance 
   * @returns Speed Modifier
   */
  calculateSpeedModifier(distance: number): number {
    const baseDistance = 10; // Base distance to normalize speed
    return distance / baseDistance; // The faster the athlete moves, the higher the modifier
  }

  /**
   * Update Location with persistent direction
   * @param currentLocation 
   * @param distance The distance to use for location update
   * @returns {Location}
   */
  updateLocation(currentLocation: Location, distance: number): Location {
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
  async publishFitnessData() {
    try {
      const fitnessData = { ...this.athleteData };
      await this.producer.send({
        topic: 'athlete-fitness-data',
        messages: [{ value: JSON.stringify(fitnessData) }],
      });
      // console.log(`Fitness data published to Kafka from ${this.athleteData.name}:`);
    } catch (error) {
      console.error(`Failed to publish fitness data from ${this.athleteData.name}:`, error);
    }
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
        } else {
          // console.log(`GPS data published to MQTT from ${this.athleteData.name}`);
        }
      });
    } catch (error) {
      console.error(`Failed to publish GPS data from ${this.athleteData.name}:`, error);
    }
  }

  /**
   * Shut down the athlete's activity, stopping data updates
   */
  async shutdown() {
    console.log(`Shutting down athlete ${this.athleteData.name}`);

    // Clear the interval to stop further updates
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    await this.producer.disconnect();
    this.mqttClient.end();
  }
}

export default Athlete;
