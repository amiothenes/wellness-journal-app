import { Request, Response } from 'express';
import { getDB } from '../db';
import { CreateSuggestionRequest } from '../models/Suggestions';

export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const entries = await db.all('SELECT * FROM coping_suggestions ORDER BY timestamp DESC');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

export const createEntry = async (req: Request<{}, {}, CreateSuggestionRequest>, res: Response) => {
  try {
    const {emotion_tag, suggestion_type_tag, related_journal_entries, text } = req.body;
    const db = getDB();
    
    const result = await db.run(
      'INSERT INTO coping_suggestions (emotion_tag, suggestion_type_tag, related_journal_entries, text) VALUES (?, ?, ?, ?)',
      [emotion_tag, suggestion_type_tag, related_journal_entries, text]
    );
    
    res.status(201).json({ 
      id: result.lastID,
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
    
    await db.run('DELETE FROM coping_suggestions WHERE id = ?', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};