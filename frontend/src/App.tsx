import React, {useEffect, useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import MoodGraph from './components/MoodGraph';
import './styles/App.css';
import Main from './components/Main'
import Sidebar from './components/Sidebar';
import { JournalEntry, ChatParagraph } from './types/Entry';
import { journalAPI } from './services/api';
import { isToday } from './utils/dateUtils';
import { calculateLiveMood } from './utils/moodUtils';
import { analyzeSentiment, shouldGenerateResponse, generateAIResponse } from './utils/aiUtils';

function App() {

  const [allEntries, setAllEntries] = React.useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<JournalEntry | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [todaysEntryExists, setTodaysEntryExists] = useState(false);
  const [moodCache, setMoodCache] = useState<{[entryId: number]: number | null}>({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (selectedEntry && isToday(selectedEntry.timestamp) && selectedEntry.paragraphs) {
      const mood = calculateLiveMood(selectedEntry.paragraphs);
      setMoodCache(prev => ({
        ...prev,
        [selectedEntry.entry_id]: mood
      }));
    }
  }, [selectedEntry]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all entries
        const entries = await journalAPI.getAllEntries();
        setAllEntries(entries);
        
        // Check if today's entry exists
        const todaysEntry = await journalAPI.getTodaysEntry();
        setTodaysEntryExists(todaysEntry !== null);
        
        // Prioritize loading today's entry if it exists, otherwise load the first entry
        if (entries.length > 0) {
          const entryToLoad = todaysEntry || entries[0];
          try {
            const paragraphs = await journalAPI.getEntryParagraphs(entryToLoad.entry_id);
            setSelectedEntry({
              ...entryToLoad,
              paragraphs: paragraphs
            });
          } catch (error) {
            console.error('Failed to load paragraphs for entry:', error);
            setSelectedEntry({ ...entryToLoad, paragraphs: [] });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
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

  const handleNewEntry = async () => {
    if (todaysEntryExists) {
      return;
    }
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
      setTodaysEntryExists(true);
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
      
      const existingParagraphs = selectedEntry.paragraphs || [];
      const newParagraph: ChatParagraph = {
        paragraph_id: existingParagraphs.length > 0 
          ? Math.max(...existingParagraphs.map(p => p.paragraph_id)) + 1 
          : 1,
        timestamp: new Date().toISOString(),
        text: text,
        mood: mood,
        paragraph_type: "user"
      };
      
      
    let updatedParagraphs = [...existingParagraphs, newParagraph];
    
    // Check if AI should respond
    const sentiment = analyzeSentiment(text, mood);
    // if (sentiment.threshold_met && shouldGenerateResponse(existingParagraphs)) {
    if (true) {
      try {
        const aiResponseText = generateAIResponse(sentiment, text);
        const aiResponseData = {
          sentiment_score: sentiment.score,
          response_type: sentiment.suggested_response_type,
          confidence: 0.8
        };
        
        // Save AI response to backend
        const aiResponse = await journalAPI.createAIResponse(
          selectedEntry.entry_id, 
          aiResponseText, 
          newParagraph.paragraph_id,
          aiResponseData
        );
        
        // Add AI response to local state
        updatedParagraphs.push({
          paragraph_id: aiResponse.paragraph_id,
          timestamp: aiResponse.timestamp,
          text: aiResponse.text,
          mood: 5,
          paragraph_type: "ai_response",
          trigger_paragraph_id: newParagraph.paragraph_id,
          ai_response_data: aiResponseData
        });
      } catch (error) {
        console.error('Failed to generate AI response:', error);
      }
    }
    
    const updatedEntry = {
      ...selectedEntry,
      paragraphs: updatedParagraphs
    };
    
    const updatedEntries = allEntries.map(entry =>
      entry.entry_id === selectedEntry.entry_id ? updatedEntry : entry
    );
      
      setAllEntries(updatedEntries);
      setSelectedEntry(updatedEntry);
      
      // If this is today's entry and it's the first paragraph, mark today's entry as existing
      if (isToday(selectedEntry.timestamp) && existingParagraphs.length === 0) {
        setTodaysEntryExists(true);
      }
  
      // After successful save, update mood cache if it's today's entry
      if (selectedEntry && isToday(selectedEntry.timestamp)) {
        const updatedMood = calculateLiveMood(updatedEntry.paragraphs.filter(p => p.paragraph_type === 'user'));
        setMoodCache(prev => ({
          ...prev,
          [selectedEntry.entry_id]: updatedMood
        }));
      }
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
          if (updatedEntries.length > 0) {
            // Fetch paragraphs for the new selected entry
            try {
              const paragraphs = await journalAPI.getEntryParagraphs(updatedEntries[0].entry_id);
              setSelectedEntry({
                ...updatedEntries[0],
                paragraphs: paragraphs
              });
            } catch (error) {
              console.error('Failed to load paragraphs for new selected entry:', error);
              setSelectedEntry({ ...updatedEntries[0], paragraphs: [] });
            }
          } else {
            setSelectedEntry(null);
          }
        }

      if (isToday(entry.timestamp)) {
        setTodaysEntryExists(false);
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
    <Routes>
      <Route
        path="/"
        element={
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
                onDelete={handleEntryDelete}
                canCreateNewEntry={!todaysEntryExists}
                moodCache={moodCache}
              />
            </div>
            <div className='main-container'>
              <Main
                selectedEntry={selectedEntry}
                onSave={handleSave}
                onDelete={handleParagraphDelete}/>
            </div>
          </div>
        }
      />
      <Route path="/mood-graph" element={<MoodGraph entries={allEntries} />} />
    </Routes>
  );
}

export default App;
