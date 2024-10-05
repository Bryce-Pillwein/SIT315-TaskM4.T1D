import { exec } from 'child_process';
import mqtt, { MqttClient } from 'mqtt';
import { Kafka } from 'kafkajs';


// Thresholds for scaling
const MAX_ATHLETES_PER_PROCESSOR = 5;
const MIN_REPLICAS = 1;
const MAX_REPLICAS = 10;

let totalAthletesProcessing = 0;  // This will track the total number of athletes

// Connect to MQTT broker
const client: MqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

client.on('connect', () => {
  console.log('Connected to MQTT broker for scaling.');

  // Subscribe to 'simulation/start' topic
  client.subscribe('simulation/start', (err) => {
    if (err) {
      console.error("Failed to subscribe to 'simulation/start' topic:", err);
    }
  });
});

// Handle incoming messages
client.on('message', (topic: string, message: Buffer) => {
  if (topic === 'simulation/start') {
    const data = message.toString();

    // Parse the number of athletes
    totalAthletesProcessing = parseInt(data, 10);
    if (isNaN(totalAthletesProcessing)) {
      console.error('Invalid athlete count received.');
      return;
    }

    console.log(`Received simulation start for ${totalAthletesProcessing} athletes.`);
    scaleProcessorService();
  }
});

// Function to scale the processor service based on the number of athletes
function scaleProcessorService() {
  // Calculate the number of replicas needed based on the number of athletes
  const requiredReplicas = Math.ceil(totalAthletesProcessing / MAX_ATHLETES_PER_PROCESSOR);
  const scaledReplicas = Math.max(MIN_REPLICAS, Math.min(requiredReplicas, MAX_REPLICAS));

  console.log(`Scaling to ${scaledReplicas} replicas based on ${totalAthletesProcessing} athletes.`);

  // Execute the command to scale the Docker Swarm service
  exec(`docker service scale my_stack_processor=${scaledReplicas}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error scaling processor service: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`Processor service scaled to ${scaledReplicas} replicas: ${stdout}`);

    // Now update the Kafka topic partitions based on the new number of replicas
    updateKafkaPartitions('athlete-fitness-data', scaledReplicas);
  });
}


// Kafka Partition Management Function
async function updateKafkaPartitions(topic: string, newPartitionsCount: number) {
  const kafka = new Kafka({
    clientId: 'partition-manager',
    brokers: ['kafka:9092'],
  });

  const admin = kafka.admin();

  try {
    await admin.connect();

    // Get the current partition count
    const topicMetadata = await admin.fetchTopicMetadata({ topics: [topic] });
    const currentPartitionsCount = topicMetadata.topics[0].partitions.length;

    // Only add more partitions if needed
    if (currentPartitionsCount < newPartitionsCount) {
      await admin.createPartitions({
        topicPartitions: [
          {
            topic,
            count: newPartitionsCount, // Set new partition count
          },
        ],
      });
      console.log(`Partitions updated for topic ${topic}. Now has ${newPartitionsCount} partitions.`);
      console.log(`Current partition count for ${topic}: ${currentPartitionsCount}`);
    } else {
      console.log(`Topic ${topic} already has sufficient partitions (${currentPartitionsCount}).`);
    }

  } catch (error) {
    console.error('Error updating partitions:', error);
  } finally {
    await admin.disconnect();
  }
}
