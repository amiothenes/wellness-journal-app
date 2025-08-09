import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Main from './components/Main'
import Sidebar from './components/Sidebar';
import { JournalEntry, ChatParagraph } from './types/Entry';
import { journalAPI } from './services/api';

function App() {

  const [allEntries, setAllEntries] = React.useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<JournalEntry | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Load entries on component mount
    journalAPI.getAllEntries()
      .then(async entries => {
        setAllEntries(entries)
        if (entries.length > 0) {
          //load paragraphs for first entry
          try {
            const paragraphs = await journalAPI.getEntryParagraphs(entries[0].entry_id);
            setSelectedEntry({
              ...entries[0],
              paragraphs: paragraphs
          });
        } catch (error) {
          console.error('Failed to load paragraphs for first entry:', error);
          setSelectedEntry({ ...entries[0], paragraphs: [] });
        }
      }
      })
      .catch(error => console.error('Failed to load entries:', error));
  }, []);
  
  // user clicks side bar journalEntry date from list and it loads it as selectedEntry
  const handleClick = async (entry: JournalEntry) => {
    try {
      // Fetch paragraphs for the selected entry
      const paragraphs = await journalAPI.getEntryParagraphs(entry.entry_id);
      
      // Update the entry with paragraphs
      const entryWithParagraphs = {
        ...entry,
        paragraphs: paragraphs
      };
      
      setSelectedEntry(entryWithParagraphs);
    } catch (error) {
      console.error('Failed to load paragraphs:', error);
      // Fallback: set entry without paragraphs
      setSelectedEntry({ ...entry, paragraphs: [] });
    }
  }
  // ...existing code...
  // user saves the form - updating selectedEntry AND/OR adding to allEntries

  const handleNewEntry = async () => {
    // Create new entry via API
      try {
        const newEntry = await journalAPI.createEntry();
        
        // Convert API response to frontend format
        const formattedEntry: JournalEntry = {
          entry_id: newEntry.entry_id,
          timestamp: new Date().toISOString(),
          paragraphs: []
        };
        
        setAllEntries([formattedEntry, ...allEntries]);
        setSelectedEntry(formattedEntry);
      } catch (error) {
        console.error('Failed to create entry:', error);
      }
  }

  const handleSave = async (mood: number, text: string) => {
    if (!selectedEntry) {
      await handleNewEntry();
      return;
    }

    try {
      await journalAPI.addParagraph(selectedEntry.entry_id, mood, text);
      
      // Update local state
      const existingParagraphs = selectedEntry.paragraphs || [];
      const newParagraph = {
      paragraph_id: existingParagraphs.length > 0 
        ? Math.max(...existingParagraphs.map(p => p.paragraph_id)) + 1 
        : 1,
      timestamp: new Date().toISOString(),
      text: text,
      mood: mood
    };
      
      const updatedEntry = {
        ...selectedEntry,
        paragraphs: [...existingParagraphs, newParagraph]
      };
      
      const updatedEntries = allEntries.map(entry =>
        entry.entry_id === selectedEntry.entry_id ? updatedEntry : entry
      );
      
      setAllEntries(updatedEntries);
      setSelectedEntry(updatedEntry);
    } catch (error) {
      console.error('Failed to add paragraph:', error);
    }
  }

  const handleEntryDelete = async (entry: JournalEntry) => {
    let userConfirmed = window.confirm(`Are you sure you want to delete the entry from ${new Date(entry.timestamp).toLocaleDateString()}? This will delete all paragraphs and cannot be undone.`);

    if (userConfirmed) {
      try {
        await journalAPI.deleteEntry(entry.entry_id);

        // Remove from local state
        const updatedEntries = allEntries.filter(e => e.entry_id !== entry.entry_id);
        setAllEntries(updatedEntries);

        // If deleted entry was selected, clear selection or select another
        if (selectedEntry?.entry_id === entry.entry_id) {
          setSelectedEntry(updatedEntries.length > 0 ? updatedEntries[0] : null);
        }
      } catch (error) {
        console.error('Failed to delete paragraph:', error);
      }
    }
  }

  const handleParagraphDelete = async (paragraph: ChatParagraph) => {
    let userConfirmed = window.confirm(`Are you sure you want to delete this paragraph? This cannot be undone.`);

    if (userConfirmed) {
      try {
        await journalAPI.deleteParagraph(paragraph.paragraph_id);

        // Remove from local state
        if (selectedEntry) {
          const updatedParagraphs = selectedEntry.paragraphs.filter(p => p.paragraph_id !== paragraph.paragraph_id);
          const updatedEntry = { ...selectedEntry, paragraphs: updatedParagraphs };
          
          setSelectedEntry(updatedEntry);
          
          // Update allEntries as well
          const updatedAllEntries = allEntries.map(entry =>
            entry.entry_id === selectedEntry.entry_id ? updatedEntry : entry
          );
          setAllEntries(updatedAllEntries);
        }
      } catch (error) {
        console.error('Failed to delete paragraph:', error);
      }
    }
  }

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <div className='sidebar-container'>
        <Sidebar 
          allEntries={allEntries}
          selectedEntry={selectedEntry}
          onEntryClick={handleClick}
          onNewEntry={handleNewEntry}
          onDelete={handleEntryDelete}/>
      </div>
      <div className='main-container'>
        <Main
          selectedEntry={selectedEntry}
          onSave={handleSave}
          onDelete={handleParagraphDelete}/>
      </div>
    </div>
  );
}

export default App;
