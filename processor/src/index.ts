import { createKafkaConsumer } from './kafka/kafkaConsumer';
import { processFitnessData } from './processors/fitnessAgregator';
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');
const containerIndex = parseInt(process.env.CONTAINER_INDEX || '0', 10);
let processedMessagesCount = 0;

/**
 * Publish Processor Metrics to MQTT
 */
const publishProcessorMetrics = () => {
  const metrics = {
    containerId: containerIndex,
    processedMessagesCount,
    timestamp: new Date().toISOString(),
  };

  mqttClient.publish(`processor/${containerIndex}/metrics`, JSON.stringify(metrics), { qos: 0 }, (error) => {
    if (error) {
      console.error(`Failed to publish processor metrics for container ${containerIndex}:`, error);
    } else {
      console.log(`Processor metrics published for container ${containerIndex}`);
    }
  });
};

/**
 * Run the processor and track metrics
 */
async function run() {
  mqttClient.on('connect', () => {
    console.log(`Processor ${containerIndex} connected to MQTT broker for metrics.`);
  });

  await createKafkaConsumer('athlete-fitness-data', 'fitness-group', async (message) => {
    await processFitnessData(message);
    processedMessagesCount++;

    // Publish metrics after every message processed
    publishProcessorMetrics();
  });
}

run().catch(console.error);
