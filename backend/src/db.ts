import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDB() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      avg_mood REAL DEFAULT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_paragraphs (
      paragraph_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      text TEXT,
      mood INTEGER,
      paragraph_type TEXT DEFAULT 'user',
      trigger_paragraph_id INTEGER DEFAULT NULL,
      ai_response_data TEXT DEFAULT NULL,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(entry_id) ON DELETE CASCADE
    );
  `);

}

export function getDB() {
  return db;
}