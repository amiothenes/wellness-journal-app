import React from "react";
import "../styles/TypingIndicator.css";

const TypingIndicator: React.FC = () => {
  return (
    <div className="paragraph-item ai-response typing-indicator">
      <div className="typing-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <div className="paragraph-meta">
        <span className="ai-badge">AI Assistant</span>
        <span>Typing...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
