"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomName = generateRandomName;
exports.generateSex = generateSex;
exports.generateAge = generateAge;
exports.generateWeight = generateWeight;
exports.calculateMaxHeartRate = calculateMaxHeartRate;
/**
 * Generate Random Name
 * @returns Random Name
 */
function generateRandomName() {
    const firstNames = ['Darrow', 'Fitz', 'Chade', 'Verity', 'Achilles', 'Kvothe', 'Locke', 'Azriel', 'Morgana', 'Casian',
        'Joel', 'Jason', 'James', 'Zoe', 'Bryce', 'Jenna', 'Nic', 'Charlotte', 'Emma', 'Sophia', 'Mia', 'Luna', 'Evenly',
        'Theodore', 'Lucas', 'Mateo', 'Henry', 'William', 'SpeedyBoi', 'FastAF', 'Edna'];
    const lastNames = ['Andromedeus', 'Chivalry', 'Orphan', 'Lamora', 'Fitz', 'Thatcher', 'Raven', 'Bardot', 'Monroe',
        'McGrath', 'Geddes', 'Adler', 'Brown', 'Lee', 'Jones', 'Garcia', 'Martinez', 'Davis', 'Mode', 'Solar', 'Mars'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}
/**
 * Generate Sex
 * @returns biological sex
 */
function generateSex() {
    return Math.random() > 0.5 ? 'male' : 'female';
}
/**
 * Generate Age
 * @returns age
 */
function generateAge() {
    return Math.floor(Math.random() * (50 - 20) + 20);
}
/**
 * Generate Weight
 * @returns weight
 */
function generateWeight() {
    return Math.floor(Math.random() * (90 - 50) + 50);
}
/**
 * Calculate Max Heart Rate
 * @param age
 * @returns MHR
 */
function calculateMaxHeartRate(age) {
    return 220 - age; // MHR formula: 220 - age
}
