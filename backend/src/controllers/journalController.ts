import { Request, Response } from 'express';
import { getDB } from '../db';
import { generateTherapyResponse } from '../services/llmService';

export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const entries = await db.all('SELECT * FROM journal_entries ORDER BY timestamp DESC');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

export const getAllParagraphs = async (req: Request, res: Response) => {
 try {
    const { entryId } = req.params;

    const numericEntryId = parseInt(entryId);
    if (isNaN(numericEntryId) || numericEntryId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid entry ID.' 
      });
    }

    const db = getDB();
    const paragraphs = await db.all(
      'SELECT * FROM chat_paragraphs WHERE entry_id = ? ORDER BY paragraph_id ASC',
      [numericEntryId]
    );
    res.json(paragraphs);
 } catch (error) {
  res.status(500).json({ error: 'Failed to fetch paragraphs of the entry' });
 }
}

export const createEntry = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    const result = await db.run(
      'INSERT INTO journal_entries (timestamp) VALUES (CURRENT_TIMESTAMP)'
    );
    
    res.status(201).json({ 
      entry_id: result.lastID,
      message: 'Entry created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

export const createParagraph = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { mood, text, paragraph_type='user' } = req.body;
    
    const numericEntryId = parseInt(entryId);
    if (isNaN(numericEntryId) || numericEntryId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid entry ID.' 
      });
    }

    const db = getDB();

    const result = await db.run(
      'INSERT INTO chat_paragraphs (entry_id, mood, text, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [numericEntryId, mood, text]
    );
    
    res.status(201).json({ 
      paragraph_id: result.lastID,
      entry_id: numericEntryId,
      mood,
      text,
      message: 'Paragraph created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create paragraph' });
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const db = getDB();

    const numericId = parseInt(entryId);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid entry ID.' 
      });
    }
    
    await db.run('DELETE FROM journal_entries WHERE entry_id = ?', [numericId]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

export const deleteParagraph = async (req: Request, res: Response) => {
  try {
    const { paragraphId } = req.params;
    const db = getDB();

    const numericId = parseInt(paragraphId);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid entry ID.' 
      });
    }
    
    await db.run('DELETE FROM chat_paragraphs WHERE paragraph_id = ?', [numericId]);
    res.json({ message: 'Paragraph deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete paragraph' });
  }
};

export const getTodaysEntry = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const entry = await db.get(
      `SELECT * FROM journal_entries 
       WHERE DATE(timestamp) = ? 
       ORDER BY timestamp DESC LIMIT 1`,
      [today]
    );
    
    if (entry) {
      // Get paragraphs for today's entry
      const paragraphs = await db.all(
        'SELECT * FROM chat_paragraphs WHERE entry_id = ? ORDER BY timestamp ASC',
        [entry.entry_id]
      );
      
      res.json({ ...entry, paragraphs });
    } else {
      res.status(404).json({ message: 'No entry found for today' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s entry' });
  }
};

// Helper function to calculate average mood
const calculateAverageMood = async (entryId: number): Promise<number | null> => {
  const db = getDB();
  const result = await db.get(
    'SELECT AVG(mood) as avg_mood, COUNT(*) as count FROM chat_paragraphs WHERE entry_id = ? AND paragraph_type = ?',
    [entryId, 'user']
  );
  
  return result.count > 0 ? Math.round(result.avg_mood * 10) / 10 : null;
};

// Function to finalize old entries (calculate and store avg_mood)
export const finalizeOldEntries = async () => {
  try {
    const db = getDB();
    
    // Find entries from previous days that don't have avg_mood calculated
    const oldEntries = await db.all(`
      SELECT entry_id FROM journal_entries 
      WHERE DATE(timestamp) < DATE('now') 
      AND avg_mood IS NULL
    `);
    
    console.log(`Finalizing ${oldEntries.length} old entries...`);
    
    for (const entry of oldEntries) {
      const avgMood = await calculateAverageMood(entry.entry_id);
      await db.run(
        'UPDATE journal_entries SET avg_mood = ? WHERE entry_id = ?',
        [avgMood, entry.entry_id]
      );
    }
    
    if (oldEntries.length > 0) {
      console.log(`Finalized ${oldEntries.length} entries with average moods.`);
    }
  } catch (error) {
    console.error('Error finalizing old entries:', error);
  }
};

export const generateAIResponseText = async (req: Request, res: Response) => {
  try {
    const { text, mood, emotionType, sentimentScore } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ 
        error: 'Missing required field: text' 
      });
    }
    
    // Default values if not provided
    const moodValue = mood || 5;
    const emotionTypeValue = emotionType || 'default';
    const sentimentScoreValue = sentimentScore || 0;
    
    const response = await generateTherapyResponse(text, moodValue, emotionTypeValue, sentimentScoreValue);
    
    res.json({ response });
  } catch (error) {
    console.error('Failed to generate AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

export const createAIResponse = async (req: Request, res: Response) => {
  try {
    const { entryId, text, triggerParagraphId, aiResponseData } = req.body;
    
    const numericEntryId = parseInt(entryId);
    if (isNaN(numericEntryId) || numericEntryId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid entry ID.' 
      });
    }

    const db = getDB();

    const result = await db.run(
      `INSERT INTO chat_paragraphs 
       (entry_id, text, mood, paragraph_type, trigger_paragraph_id, ai_response_data, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [numericEntryId, text, 5, 'ai_response', triggerParagraphId, JSON.stringify(aiResponseData)]
    );
    
    res.status(201).json({ 
      paragraph_id: result.lastID,
      entry_id: numericEntryId,
      text,
      timestamp: new Date().toISOString(),
      paragraph_type: 'ai_response',
      trigger_paragraph_id: triggerParagraphId,
      ai_response_data: aiResponseData,
      message: 'AI response created successfully' 
    });
  } catch (error) {
    console.error('Failed to create AI response:', error);
    res.status(500).json({ error: 'Failed to create AI response' });
  }
};