import { Kafka, Consumer } from 'kafkajs';

// Create and configure Kafka consumer
export const kafka = new Kafka({
  clientId: 'fitness-processor',
  brokers: ['kafka:9092'],
});

export async function createKafkaConsumer(topic: string, groupId: string, processMessage: (message: any) => Promise<void>) {
  const consumer: Consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const parsedMessage = JSON.parse(message.value?.toString() || '{}');
        await processMessage(parsedMessage);
      } catch (error) {
        console.error('Error processing Kafka message:', error);
      }
    },
  });
}
