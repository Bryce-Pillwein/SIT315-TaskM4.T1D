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
exports.kafka = void 0;
exports.createKafkaConsumer = createKafkaConsumer;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../config/config");
// Create and configure Kafka consumer
exports.kafka = new kafkajs_1.Kafka({
    clientId: 'fitness-processor',
    brokers: config_1.KAFKA_BROKERS,
});
function createKafkaConsumer(topic, groupId, processMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = exports.kafka.consumer({ groupId });
        yield consumer.connect();
        yield consumer.subscribe({ topic, fromBeginning: true });
        yield consumer.run({
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message }) {
                var _b;
                try {
                    const parsedMessage = JSON.parse(((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()) || '{}');
                    yield processMessage(parsedMessage);
                }
                catch (error) {
                    console.error('Error processing Kafka message:', error);
                }
            }),
        });
    });
}
