export interface JournalEntry {
  id?: number;
  mood: number;
  text: string;
  timestamp?: Date;
}

export interface CreateJournalEntryRequest {
  mood: number;
  text: string;
}