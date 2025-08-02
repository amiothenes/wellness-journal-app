import React, {ChangeEvent, FormEvent} from 'react';
import '../styles/Main.css';

function Main() {
    const [currentMood, setCurrentMood] = React.useState<number>(5);
    const [currentEntry, setCurrentEntry] = React.useState<string>();
    const [savedEntry, setSavedEntry] = React.useState<string>();

    const handleMood = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentMood(parseInt(event.target.value));
    }

    const handleCurrentEntry = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentEntry(event.target.value);
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSavedEntry(currentEntry);
        setCurrentEntry("");
    }

  return (
    <div>
        <p>{savedEntry}</p>
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
