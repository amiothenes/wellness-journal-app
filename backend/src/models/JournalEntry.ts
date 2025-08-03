export interface JournalEntry {
  id: number;
  timestamp: Date;
  paragraphs: ChatParagraph[];
}

export interface ChatParagraph {
  id: number;
  timestamp: Date;
  text: string;
  mood: number;
}

export interface CreateJournalEntryRequest {
  mood: number;
  text: string;
}