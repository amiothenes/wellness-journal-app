import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import journalRoutes from './routes/journalRoutes';
import suggestionRoutes from './routes/suggestionRoutes';
import moodRoutes from './routes/moodRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/journals', journalRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/moods', moodRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});

async function startServer() {
  try {
    await initDB();
    console.log('✅ Database initialized');
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();