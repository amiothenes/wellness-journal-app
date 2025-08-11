import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import '../styles/Main.css';
import {ChatParagraph, JournalEntry, MainProps} from '../types/Entry';
import {isToday, isPastDate} from '../utils/dateUtils';
import {getMoodColor, getBgMoodColor} from '../utils/moodUtils';

function Main({selectedEntry, onSave, onDelete}: MainProps) {
    const [currentMood, setCurrentMood] = useState<number>(5);
    const [currentEntry, setCurrentEntry] = useState<string>("");
    const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(selectedEntry);

    const isReadOnly = savedEntry ? isPastDate(savedEntry.timestamp) : false;
    const isCurrentDay = savedEntry ? isToday(savedEntry.timestamp) : false;

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
        const hasAlpha = /[a-zA-Z]/.test(currentEntry);
        const notAllSpaces = currentEntry.trim().length > 0;
        if (currentEntry.length > 10 && hasAlpha && notAllSpaces) {
            onSave(currentMood, currentEntry);
            setCurrentEntry("");
            setCurrentMood(5);
        }
    }

  return (
    <div className='main'>
        <div className='main-background'></div>
        <div className="paragraphs-display">
            {(savedEntry?.paragraphs || []).map((paragraph) => (
                <div key={paragraph.paragraph_id} className="paragraph-item">
                    <p>{paragraph.text}</p>
                    <div className="paragraph-meta">
                        <span className='mood-badge'
                            style={{backgroundColor: getBgMoodColor(paragraph.mood),
                                    color: getMoodColor(paragraph.mood)
                            }}>
                            Mood: {paragraph.mood}/10
                        </span>
                        <span>{new Date(paragraph.timestamp).toLocaleString()}</span>
                        {isCurrentDay && (
                            <button className='paragraph-delete' onClick={() => onDelete(paragraph)}>Delete</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
        {isCurrentDay && (
            <form onSubmit={handleSubmit}>
                <textarea rows={10}
                    placeholder="What's on your mind?"
                    onChange={handleCurrentEntry}
                    value={currentEntry}>
                </textarea>
                <div className="mood-selector-container">
                    <span className="mood-label">Select Mood:</span>
                    <div className="mood-slider">
                        <div className='slider-container'>
                            <div className='slider-track'></div>
                            <span className='slider-min-max'>1</span>
                            <div className='slider-ticks'>
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className='slider-tick'></div>
                                ))}
                            </div>
                            <input type="range"
                                min={1}
                                max={10}
                                step={1}
                                value={currentMood}
                                onChange={handleMood}
                            ></input>
                            <span className='slider-min-max'>10</span>
                        </div>
                        <div className='slider-value'
                            style={{backgroundColor: getBgMoodColor(currentMood),
                                        color: getMoodColor(currentMood)
                                }}>{currentMood}</div>
                    </div>
                    <button type="submit" className="save-button" aria-label="Save entry">
                        <span className="">Save</span>
                    </button>
                </div>
            </form>
        )}
        {isReadOnly && (
            <div className="read-only-message">
                <p>This is a past entry and cannot be modified.</p>
            </div>
        )}

    </div>
  );
}

export default Main;