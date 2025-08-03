import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import '../styles/Main.css';
import {ChatParagraph, JournalEntry, MainProps} from '../types/Entry';

function Main({selectedEntry, onSave, onDelete}: MainProps) {
    const [currentMood, setCurrentMood] = useState<number>(5);
    const [currentEntry, setCurrentEntry] = useState<string>("");
    const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(selectedEntry);

    useEffect(() => {
        if (selectedEntry) {
            // Update savedEntry when selectedEntry changes
            setSavedEntry(selectedEntry);
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
        setCurrentMood(5);
    }

  return (
    <div>
        <div className="paragraphs-display">
            {(savedEntry?.paragraphs || []).map((paragraph) => (
                <div key={paragraph.paragraph_id} className="paragraph-item">
                    <p>{paragraph.text}</p>
                    <div className="paragraph-meta">
                        <span>Mood: {paragraph.mood}/10</span>
                        <span>{new Date(paragraph.timestamp).toLocaleString()}</span>
                        <button className='paragraph-delete' onClick={() => onDelete(paragraph)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
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