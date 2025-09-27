import { useState, useCallback } from 'react';
import { CenterMessage } from './CenterMessage';

export function useToast() {
  const [message, setMessage] = useState<CenterMessage | null>(null);

  const showMessage = useCallback((messageText: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: CenterMessage = {
      id,
      message: messageText
    };

    // Override any existing message
    setMessage(newMessage);
  }, []);

  const removeMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showSuccess = useCallback((messageText: string) => {
    showMessage(messageText);
  }, [showMessage]);

  const showError = useCallback((messageText: string) => {
    showMessage(messageText);
  }, [showMessage]);

  const showInfo = useCallback((messageText: string) => {
    showMessage(messageText);
  }, [showMessage]);

  return {
    message,
    removeMessage,
    showSuccess,
    showError,
    showInfo
  };
}
