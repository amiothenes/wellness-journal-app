import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Main.css";
import { ChatParagraph, JournalEntry, MainProps } from "../types/Entry";
import { isToday, isPastDate } from "../utils/dateUtils";
import { getMoodColor, getBgMoodColor } from "../utils/moodUtils";
import TypingIndicator from "./TypingIndicator";
import MarkdownRenderer from "./MarkdownRenderer";

function Main({ selectedEntry, onSave, onDelete, isAIResponding }: MainProps) {
  const navigate = useNavigate();
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [currentEntry, setCurrentEntry] = useState<string>("");
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(
    selectedEntry
  );
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const paragraphsDisplayRef = useRef<HTMLDivElement>(null);

  const isReadOnly = savedEntry ? isPastDate(savedEntry.timestamp) : false;
  const isCurrentDay = savedEntry ? isToday(savedEntry.timestamp) : false;

  useEffect(() => {
    setSavedEntry(selectedEntry);
    setCurrentEntry("");

    if (!selectedEntry) {
      setCurrentMood(5);
    }
  }, [selectedEntry]);

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [savedEntry?.paragraphs, isAIResponding]);

  useEffect(() => {
    const hasAlpha = /[a-zA-Z]/.test(currentEntry);
    const notAllSpaces = currentEntry.trim().length > 0;
    if (currentEntry.length > 10 && hasAlpha && notAllSpaces) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [currentEntry]);

  const handleMood = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentMood(parseInt(event.target.value));
  };

  const handleCurrentEntry = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentEntry(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(currentMood, currentEntry);
    setCurrentEntry("");
    setCurrentMood(5);
  };

  return (
    <div className="main">
      <div className="main-background"></div>
      <div className="paragraphs-display" ref={paragraphsDisplayRef}>
        {(savedEntry?.paragraphs || []).map((paragraph) => (
          <div
            key={paragraph.paragraph_id}
            className={`paragraph-item ${
              paragraph.paragraph_type === "ai_response"
                ? "ai-response"
                : "user-message"
            }`}
          >
            {paragraph.paragraph_type === "ai_response" ? (
              <MarkdownRenderer content={paragraph.text} />
            ) : (
              <p>{paragraph.text}</p>
            )}
            <div className="paragraph-meta">
              {paragraph.paragraph_type === "user" && (
                <span
                  className="mood-badge"
                  style={{
                    backgroundColor: getBgMoodColor(paragraph.mood),
                    color: getMoodColor(paragraph.mood),
                  }}
                >
                  Mood: {paragraph.mood}/10
                </span>
              )}
              {paragraph.paragraph_type === "ai_response" && (
                <span className="ai-badge">AI Assistant</span>
              )}
              <span>{new Date(paragraph.timestamp).toLocaleString()}</span>
              {paragraph.paragraph_type === "user" && isCurrentDay && (
                <button
                  className="paragraph-delete"
                  onClick={() => onDelete(paragraph)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {isAIResponding && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      {isCurrentDay && (
        <form onSubmit={handleSubmit}>
          <textarea
            rows={10}
            placeholder="What's on your mind?"
            onChange={handleCurrentEntry}
            value={currentEntry}
          ></textarea>
          <div className="bottom-bar">
            <div className="mood-slider">
              <span className="mood-label">Select Mood:</span>
              <div className="slider-container">
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{ width: `${((currentMood - 1) / 9) * 100}%` }}
                  ></div>
                </div>
                <span className="slider-min-max">1</span>
                <div className="slider-ticks">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="slider-tick"
                      style={{ left: `${(i / 9) * 100}%` }}
                    ></div>
                  ))}
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={currentMood}
                  onChange={handleMood}
                ></input>
                <span className="slider-min-max">10</span>
              </div>
              <div
                className="slider-value"
                style={{
                  backgroundColor: getBgMoodColor(currentMood),
                  color: getMoodColor(currentMood),
                }}
              >
                {currentMood}
              </div>
            </div>
            <button
              type="submit"
              className="blue-button save"
              disabled={!canSubmit}
              aria-label="Save entry"
            >
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
