import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

interface LinkTextProps {
  text: string;
  className?: string;
}

const LinkText = ({ text, className = "" }: LinkTextProps) => {
  const parts = text.split(URL_REGEX);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: "hsl(var(--accent-cyan))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {part.length > 50 ? part.slice(0, 50) + "…" : part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

export default LinkText;
