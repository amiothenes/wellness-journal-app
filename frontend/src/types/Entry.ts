export interface JournalEntry {
  entry_id: number;
  timestamp: string;
  paragraphs: ChatParagraph[];
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
    allEntries: JournalEntry[]; //how to do type of an array of JournalEntry
    onEntryClick: (entry: JournalEntry) => void; //see whether that's correct
    onNewEntry: () => void;
    onDelete: (entry: JournalEntry) => void;
}