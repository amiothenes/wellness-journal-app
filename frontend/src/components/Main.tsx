import React, {ChangeEvent} from 'react';
import '../styles/Main.css';

function Main() {
    const [currentMood, setCurrentMood] = React.useState<number>(5);
    const [entry, setEntry] = React.useState();

    const handleMood = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentMood(parseInt(event.target.value));
    }

  return (
    <div>
        <p>{entry}</p>
        <form>
            <textarea rows={10} placeholder="What's on your mind?"></textarea>
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
