import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Main.css';
import {ChatParagraph, JournalEntry, MainProps} from '../types/Entry';

function Main({selectedEntry, onSave, onDelete}: MainProps) {
    const navigate = useNavigate();
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

    const getMoodColor = (mood: number): string => {
        const colors = [
            '#dc2626',
            '#dc2626',
            '#ea580c',
            '#f59e0b',
            '#eab308',
            '#84cc16',
            '#22c55e',
            '#16a34a',
            '#059669',
            '#047857' 
        ];
        return colors[mood - 1] || colors[4]; // Default to (5)
    };

    const getBgMoodColor = (mood: number): string => {
        const bgColors = [
            '#fee2e2',
            '#fee2e2',
            '#ffedd5',
            '#fef3c7',
            '#fef9c3',
            '#ecfccb',
            '#d1fae5',
            '#bbf7d0',
            '#a7f3d0',
            '#ccfbf1'
        ];
        return bgColors[mood - 1] || bgColors[4]; // Default to (5)
    };

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
            <div className="bottom-bar">
                <button
                    className="save-button mood-graph-button"
                    aria-label="View Mood Graph"
                    type="button"
                    onClick={() => navigate('/mood-graph')}
                >
                    Mood Graph
                </button>
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
            </div>
        </form>
    </div>
  );
}

export default Main;