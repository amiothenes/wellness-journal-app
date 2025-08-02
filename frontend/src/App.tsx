import React from 'react';
import './styles/App.css';
import Main from './components/Main'
import Sidebar from './components/Sidebar';
import { JournalEntry } from './types/Entry';

function App() {

  const data = [{"entry_id":1,"timestamp":"2025-07-25 20:21:35","text":"Feeling great today!","mood":8}];
  const [allEntries, setAllEntries] = React.useState<JournalEntry[]>(data);
  const [selectedEntry, setSelectedEntry] = React.useState<JournalEntry>(data[0]);
  
  // user clicks side bar journalEntry date from list and it loads it as selectedEntry
  const handleClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  }

  // user saves the form - updating selectedEntry AND/OR adding to allEntries
  const handleSave = (mood: number, text: string) => {
    if (!selectedEntry) {
      // Create fake entry for frontend testing
      const newEntry = { //TEMP TEMP TEMP
        entry_id: Math.max(...allEntries.map(e => e.entry_id)) + 1,
        timestamp: new Date().toISOString(),
        mood: mood,
        text: text
      }
      
      // Add to array and select it
      setAllEntries([...allEntries, newEntry]);
      setSelectedEntry(newEntry);
    } else {
      const updatedEntries = allEntries.map(entry => {
        if (entry.entry_id === selectedEntry.entry_id) {
          return { ...entry, mood: mood, text: text }; // Keep original timestamp
        }
        return entry; // Keep other entries unchanged
      });
      setAllEntries(updatedEntries);
      setSelectedEntry({...selectedEntry, mood: mood, text: text});
    }
  }

  return (
    
    <div className="App">
        <Sidebar allEntries={allEntries} onEntryClick={handleClick}/>
        <Main selectedEntry={selectedEntry} onSave={handleSave}/>
    </div>
  );
}

export default App;
