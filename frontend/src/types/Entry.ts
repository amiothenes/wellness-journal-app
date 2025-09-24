export interface JournalEntry {
  entry_id: number;
  timestamp: string;
  paragraphs: ChatParagraph[];
  avg_mood?: number | null;
}

export interface ChatParagraph {
  paragraph_id: number;
  timestamp: string;
  text: string;
  mood: number;
  paragraph_type: 'user' | 'ai_response';
  trigger_paragraph_id?: number;
  ai_response_data?: {
    sentiment_score?: number;
    response_type?: 'acknowledgment' | 'coping_strategy' | 'therapy_suggestion';
    confidence?: number;
  };
}

export interface MainProps {
  selectedEntry: JournalEntry | null;
  onSave: (mood: number, text: string) => void;
  onDelete: (paragraph: ChatParagraph) => void ;
  isAIResponding: boolean;
}

export interface SidebarProps {
    allEntries: JournalEntry[];
    selectedEntry: JournalEntry | null;
    onEntryClick: (entry: JournalEntry) => void;
    onNewEntry: () => void;
    onDelete: (entry: JournalEntry) => void;
    canCreateNewEntry: boolean;
    moodCache: {[entryId: number]: number | null};
}