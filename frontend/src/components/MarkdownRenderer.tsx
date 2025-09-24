import React from "react";
import ReactMarkdown from "react-markdown";
import "../styles/MarkdownRenderer.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          // Custom paragraph renderer to handle line breaks
          p: ({ children }) => <p className="markdown-paragraph">{children}</p>,

          // Custom strong/bold renderer
          strong: ({ children }) => (
            <strong className="markdown-bold">{children}</strong>
          ),

          // Custom emphasis/italic renderer
          em: ({ children }) => <em className="markdown-italic">{children}</em>,

          // Custom list renderers
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => (
            <ol className="markdown-list markdown-ordered-list">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="markdown-list-item">{children}</li>
          ),

          // Custom code renderer
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="markdown-code-inline">{children}</code>
            ) : (
              <code className="markdown-code-block">{children}</code>
            );
          },

          // Custom blockquote renderer
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),

          // Custom heading renderers
          h1: ({ children }) => (
            <h1 className="markdown-heading markdown-h1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="markdown-heading markdown-h2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="markdown-heading markdown-h3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="markdown-heading markdown-h4">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="markdown-heading markdown-h5">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="markdown-heading markdown-h6">{children}</h6>
          ),

          // Custom link renderer (disable for security)
          a: ({ children }) => (
            <span className="markdown-link-disabled">{children}</span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
