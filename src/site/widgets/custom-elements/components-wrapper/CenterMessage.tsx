import React, { useEffect, useState } from 'react';

export interface CenterMessage {
  id: string;
  message: string;
}

interface CenterMessageProps {
  message: CenterMessage | null;
  onRemove: () => void;
}

export function CenterMessageDisplay({ message, onRemove }: CenterMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(), 300); // Wait for fade out animation
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onRemove]);

  if (!message) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px 30px',
        backgroundColor: 'white',
        border: '1px solid black',
        color: 'black',
        textAlign: 'center',
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isVisible ? 1 : 0,
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '200px',
        maxWidth: '400px',
        wordWrap: 'break-word'
      }}
    >
      {message.message}
    </div>
  );
}
