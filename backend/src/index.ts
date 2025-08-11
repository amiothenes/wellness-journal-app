import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import journalRoutes from './routes/journalRoutes';
import suggestionRoutes from './routes/suggestionRoutes';
import moodRoutes from './routes/moodRoutes';
import { finalizeOldEntries } from './controllers/journalController';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/journal', journalRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/moods', moodRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running.');
});

async function startServer() {
  try {
    await initDB();
    console.log('Database initialized.');

    console.log('Checking for old entries to finalize...');
    await finalizeOldEntries();

    const runDailyFinalization = () => {
      console.log('Running daily finalization job...');
      finalizeOldEntries();
    };
    
    // every 24 hours
    setInterval(runDailyFinalization, 24 * 60 * 60 * 1000);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();