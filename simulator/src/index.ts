import express from 'express';
import Athlete from './athlete';
import cors from 'cors';
import mqtt from 'mqtt';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

let athletes: Athlete[] = [];

const hostname = process.env.HOSTNAME;

// const containerIndex = parseInt(process.env.HOSTNAME?.split('_').pop() || '0', 10); // Get container index
const containerIndex = parseInt(process.env.CONTAINER_INDEX || '0', 10);
const containerCount = parseInt(process.env.CONTAINER_COUNT || '1', 10);
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

console.log(`Container Index: ${containerIndex}`);
console.log(`Container Hostname: ${hostname}`);


/**
 * Publish Metrics
 */
const publishMetrics = () => {
  const metrics = {
    containerId: containerIndex,
    athleteCount: athletes.length,
    startIndex: athletes.length ? athletes[0].id : null,
    assignedAthletes: athletes.map(a => a.id),
    timestamp: new Date().toISOString(),
  };

  mqttClient.publish(`simulator/${containerIndex}/metrics`, JSON.stringify(metrics), { qos: 0 }, (error) => {
    if (error) {
      console.error(`Failed to publish metrics for container ${containerIndex}:`, error);
    } else {
      console.log(`Metrics published for container ${containerIndex}`);
    }
  });
};


/**
 * Dynamically assign athletes to this container
 */
const startSimulation = async (totalAthletes: number) => {
  const athletesPerContainer = Math.floor(totalAthletes / containerCount);
  const remainderAthletes = totalAthletes % containerCount;
  let assignedAthletes = athletesPerContainer;

  if ((containerIndex - 1) < remainderAthletes) {
    assignedAthletes += 1;
  }

  const startIndex = (containerIndex - 1) * athletesPerContainer + Math.min(containerIndex - 1, remainderAthletes);
  console.log(`Container ${containerIndex}: Assigned ${assignedAthletes} athletes starting at index ${startIndex}`);

  for (let i = 0; i < assignedAthletes; i++) {
    const athleteIndex = startIndex + i;
    const athlete = new Athlete(athleteIndex);
    athletes.push(athlete);
    await athlete.start();
  }

  publishMetrics();
};


/**
 * Stop the athletes simulation
 */
const stopSimulation = async () => {
  console.log(`Stopping all athletes in container ${containerIndex}...`);
  for (const athlete of athletes) {
    await athlete.shutdown();
  }
  athletes = [];
  publishMetrics();
};



/**
 * Connect MQTT Client
 */
mqttClient.on('connect', () => {
  console.log(`Container ${containerIndex} connected to MQTT broker`);

  mqttClient.subscribe('simulation/start');
  mqttClient.subscribe('simulation/stop');
});

/**
 * Process MQTT Messages
 */
mqttClient.on('message', async (topic, message) => {
  if (topic === 'simulation/start') {
    const athleteCount = parseInt(message.toString(), 10);  // Parse athlete count from message
    console.log(`Received start command for ${athleteCount} athletes`);
    await startSimulation(athleteCount);  // Trigger the start simulation function
  } else if (topic === 'simulation/stop') {
    console.log('Received stop command');
    await stopSimulation();  // Trigger the stop simulation function
  }
});



/**
 * Start the Express server and also listen for process signals (e.g., SIGINT)
 */
async function main() {
  // Begin App
  app.listen(4000, () => {
    console.log(`Simulator API for container ${containerIndex} listening on port 4000`);
  });

  // Shutdown App
  process.on('SIGINT', async () => {
    console.log(`Shutting down all athletes in container ${containerIndex}...`);
    await stopSimulation();
    process.exit();
  });
}

main().catch((error) => {
  console.error('Error in main execution:', error);
});
