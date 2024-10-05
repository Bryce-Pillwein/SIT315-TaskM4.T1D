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
const express_1 = __importDefault(require("express"));
const athlete_1 = __importDefault(require("./athlete"));
const cors_1 = __importDefault(require("cors"));
// Initialize Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Enable CORS for localhost:3000
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
let athletes = [];
/**
 * Start athletes simulation
 */
app.post('/start', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { athleteCount } = req.body;
    if (athleteCount <= 0) {
        return res.status(400).json({ message: 'Athlete count must be greater than 0' });
    }
    // Start the specified number of athletes
    for (let i = 0; i < athleteCount; i++) {
        const athlete = new athlete_1.default();
        athletes.push(athlete);
        yield athlete.start();
    }
    return res.json({ message: `${athleteCount} athletes started.` });
}));
/**
 * Stop the athletes simulation
 */
app.post('/stop', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    for (const athlete of athletes) {
        yield athlete.shutdown();
    }
    athletes = []; // Reset the list of athletes
    return res.json({ message: 'Simulation stopped.' });
}));
/**
 * Adjust athlete count dynamically
 */
app.post('/adjust', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newAthleteCount } = req.body;
    if (!Number.isInteger(newAthleteCount) || newAthleteCount <= 0) {
        return res.status(400).json({ message: 'Athlete count must be a positive integer.' });
    }
    // Stop current athletes
    for (const athlete of athletes) {
        yield athlete.shutdown();
    }
    // Create new set of athletes
    athletes = [];
    for (let i = 0; i < newAthleteCount; i++) {
        const athlete = new athlete_1.default();
        athletes.push(athlete);
        yield athlete.start();
    }
    return res.json({ message: `Adjusted to ${newAthleteCount} athletes.` });
}));
/**
 * Start the Express server and also listen for process signals (e.g., SIGINT)
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const athleteCount = 4; // Default number of athletes to simulate
        // To start athletes on app launch without a request
        // for (let i = 0; i < athleteCount; i++) {
        //   const athlete = new Athlete();
        //   athletes.push(athlete);
        //   await athlete.start();
        // }
        app.listen(4000, () => {
            console.log('Simulator API listening on port 4000');
        });
        // Handle graceful shutdown
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Shutting down all athletes...');
            for (const athlete of athletes) {
                yield athlete.shutdown();
            }
            process.exit();
        }));
    });
}
main().catch((error) => {
    console.error('Error in main execution:', error);
});
