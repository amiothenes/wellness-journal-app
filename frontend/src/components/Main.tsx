import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import '../styles/Main.css';
import {JournalEntry, MainProps} from '../types/Entry';

function Main({selectedEntry, onSave}: MainProps) {
    const [currentMood, setCurrentMood] = useState<number>(5);
    const [currentEntry, setCurrentEntry] = useState<string>("");
    const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(selectedEntry);

    useEffect(() => {
        if (selectedEntry) {
            // Update savedEntry when selectedEntry changes
            setSavedEntry(selectedEntry);
            // Also populate the form fields
            setCurrentMood(selectedEntry.mood);
            setCurrentEntry("");
        }
        }, [selectedEntry]);

    const handleMood = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentMood(parseInt(event.target.value));
    }

    const handleCurrentEntry = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentEntry(event.target.value);
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSave(currentMood, currentEntry);
        setCurrentEntry("");
    }

  return (
    <div>
        <p>{savedEntry?.text}</p>
        <form onSubmit={handleSubmit}>
            <textarea rows={10}
                        placeholder="What's on your mind?"
                        onChange={handleCurrentEntry}
                        value={currentEntry}>
                        </textarea>
            <div className="mood-selector">
                <span>1</span><input type="range"
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={currentMood}
                                        onChange={handleMood}
                ></input><span>10</span>
                <p>{currentMood}</p>
            </div>
            <button>Save</button>
        </form>
    </div>
  );
}

export default Main;
