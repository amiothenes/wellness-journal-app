import { Request, Response } from 'express';
import { getDB } from '../db';
import { CreateJournalEntryRequest } from '../models/JournalEntry';

export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const entries = await db.all('SELECT * FROM journal_entries ORDER BY timestamp DESC');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

export const createEntry = async (req: Request<{}, {}, CreateJournalEntryRequest>, res: Response) => {
  try {
    const { mood, text } = req.body;
    const db = getDB();
    
    const result = await db.run(
      'INSERT INTO journal_entries (mood, text) VALUES (?, ?)',
      [mood, text]
    );
    
    res.status(201).json({ 
      id: result.lastID,
      mood,
      text,
      message: 'Entry created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDB();
    
    await db.run('DELETE FROM journal_entries WHERE id = ?', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};