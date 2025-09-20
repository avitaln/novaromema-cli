import React, { useEffect, useState } from 'react';
import styles from './element.module.css';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

export function Toast({ message, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(message.id), 300); // Wait for fade out animation
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message.id, message.duration, onRemove]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(message.id), 300);
  };

  return (
    <div 
      className={`toast toast-${message.type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isVisible ? 1 : 0,
        backgroundColor: message.type === 'success' ? '#4CAF50' : 
                        message.type === 'error' ? '#f44336' : '#2196F3',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        maxWidth: '300px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {message.message}
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  );
}
