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
      text TEXT,
      mood INTEGER
    );
  `);
  
  await db.exec(`
    CREATE TABLE coping_suggestions (
      suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      text TEXT NOT NULL,
      related_journal_entries TEXT, -- JSON array: "[1,3,5,7]"
      emotion_tag TEXT,
      suggestion_type_tag TEXT
);
    
  `)

}

export function getDB() {
  return db;
}