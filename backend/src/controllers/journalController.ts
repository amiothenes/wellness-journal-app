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
      'SELECT * FROM chat_paragraphs WHERE entry_id = ? ORDER BY timestamp ASC',
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
    const { mood, text } = req.body;
    
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