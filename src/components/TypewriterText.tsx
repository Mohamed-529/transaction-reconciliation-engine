import React, { useState, useEffect } from 'react';

interface Props {
  text: string;
  speed?: number;
  isActive?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<Props> = ({
  text,
  speed = 18,
  isActive = true,
  onComplete,
  className = ''
}) => {
  const [displayedLength, setDisplayedLength] = useState(isActive ? 0 : text.length);
  const [isDone, setIsDone] = useState(!isActive);

  useEffect(() => {
    if (!isActive) {
      setDisplayedLength(text.length);
      setIsDone(true);
      return;
    }

    setDisplayedLength(0);
    setIsDone(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 2; // Deliver in small bursts for snappy performance and readability
      if (currentIndex >= text.length) {
        setDisplayedLength(text.length);
        setIsDone(true);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setDisplayedLength(currentIndex);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isActive, speed]);

  return (
    <span className={className}>
      {text.slice(0, displayedLength)}
      {!isDone && (
        <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 align-middle cursor-blink" />
      )}
    </span>
  );
};
