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
}

export interface MainProps {
  selectedEntry: JournalEntry | null;
  onSave: (mood: number, text: string) => void;
  onDelete: (paragraph: ChatParagraph) => void ;
}

export interface SidebarProps {
    allEntries: JournalEntry[];
    selectedEntry: JournalEntry | null;
    onEntryClick: (entry: JournalEntry) => void;
    onNewEntry: () => void;
    onDelete: (entry: JournalEntry) => void;
    canCreateNewEntry: boolean;
}