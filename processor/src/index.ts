import { createKafkaConsumer } from './kafka/kafkaConsumer';
import { processFitnessData } from './processors/fitnessAgregator';

async function run() {
  await createKafkaConsumer('athlete-fitness-data', 'fitness-group', processFitnessData);
}

run().catch(console.error);
