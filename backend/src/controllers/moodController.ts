import { Request, Response } from 'express';
import { getDB } from '../db';
import { Mood } from '../models/Mood';

export const getEntries = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const entries = await db.all('SELECT mood, timestamp FROM journal_entries ORDER BY timestamp DESC LIMIT 30');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};