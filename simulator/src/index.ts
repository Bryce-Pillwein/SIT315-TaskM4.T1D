import express from 'express';
import Athlete from './athlete';

// Initialize Express app
const app = express();
app.use(express.json());

let athletes: Athlete[] = [];

/**
 * Start athletes simulation
 */
app.post('/start', async (req: any, res: any) => {
  const { athleteCount } = req.body;

  if (athleteCount <= 0) {
    return res.status(400).json({ message: 'Athlete count must be greater than 0' });
  }

  // Start the specified number of athletes
  for (let i = 0; i < athleteCount; i++) {
    const athlete = new Athlete();
    athletes.push(athlete);
    await athlete.start();
  }

  return res.json({ message: `${athleteCount} athletes started.` });
});

/**
 * Stop the athletes simulation
 */
app.post('/stop', async (req: any, res: any) => {
  for (const athlete of athletes) {
    await athlete.shutdown();
  }

  athletes = []; // Reset the list of athletes
  return res.json({ message: 'Simulation stopped.' });
});

/**
 * Adjust athlete count dynamically
 */
app.post('/adjust', async (req: any, res: any) => {
  const { newAthleteCount } = req.body;

  if (newAthleteCount < 0) {
    return res.status(400).json({ message: 'Invalid athlete count' });
  }

  // Stop current athletes
  for (const athlete of athletes) {
    await athlete.shutdown();
  }

  // Create new set of athletes
  athletes = [];
  for (let i = 0; i < newAthleteCount; i++) {
    const athlete = new Athlete();
    athletes.push(athlete);
    await athlete.start();
  }

  return res.json({ message: `Adjusted to ${newAthleteCount} athletes.` });
});

/**
 * Start the Express server and also listen for process signals (e.g., SIGINT)
 */
async function main() {
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
  process.on('SIGINT', async () => {
    console.log('Shutting down all athletes...');
    for (const athlete of athletes) {
      await athlete.shutdown();
    }
    process.exit();
  });
}

main().catch((error) => {
  console.error('Error in main execution:', error);
});
