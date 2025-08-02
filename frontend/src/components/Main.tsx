import React, {ChangeEvent, FormEvent} from 'react';
import '../styles/Main.css';

function Main() {
    const [currentMood, setCurrentMood] = React.useState<number>(5);
    const [currentEntry, setCurrentEntry] = React.useState<string>('');
    const [savedEntry, setSavedEntry] = React.useState<string[]>([]);

    const handleMood = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentMood(parseInt(event.target.value));
    }

    const handleCurrentEntry = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentEntry(event.target.value);
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSavedEntry(prevEntries => [...prevEntries, currentEntry.trim()]);
        setCurrentEntry("");
    }
    
    return (
        <div className='main'>
            <div className='main-background'></div>
            <div className='entries-container'>
                {savedEntry.map((entry, index) => (
                    <div key={index} className='entry'>
                        <p>{entry}</p>
                        {index < savedEntry.length - 1}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <textarea 
                    rows={10}
                    placeholder="What's on your mind?"
                    onChange={handleCurrentEntry}
                    value={currentEntry}
                />
                
                <div className="mood-selector-container">
                    <span className="mood-label">Select Mood:</span>
                    
                    <div className='mood-slider'>
                        <div className='slider-container'>
                            <span className='slider-min-max'>1</span>
                            <div className='slider-track-container'>
                                <div className='slider-track'></div>
                                <div className='slider-ticks'>
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className='slider-tick'></div>
                                    ))}
                                </div>
                                <input 
                                    type="range"
                                    className='slider-input'
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={currentMood}
                                    onChange={handleMood}
                                />
                            </div>
                            <span className='slider-min-max'>10</span>
                        </div>
                        <div className='slider-value'>{currentMood}</div>
                    </div>
                    
                    <button type="submit" className="save-button" aria-label="Save entry">
                        <span className="visually-hidden">Save</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Main;