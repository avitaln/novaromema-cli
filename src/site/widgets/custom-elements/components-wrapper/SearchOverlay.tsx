import React, { useState, useEffect } from 'react';
import styles from './element.module.css';

const searchTypeTags = [
  { "value": "name", "label": "כותרת ואמן" },
  { "value": "title", "label": "רק כותרת" },
  { "value": "artist", "label": "רק אמן" },
  { "value": "tracklist", "label": "שמות הקטעים" }
];

const formatOptions = [
  { value: 'all', label: 'תקליטים ודיסקים', path: '/all' },
  { value: 'vinyl', label: 'רק תקליטים', path: '/vinyl' },
  { value: 'cd', label: 'רק דיסקים', path: '/cd' }
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ 
  isOpen, 
  onClose,
  placeholder: _placeholder = "חיפוש בתוצאות"
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [format, setFormat] = useState('all');

  // Generate dynamic placeholder based on selections
  const getPlaceholder = () => {
    const formatLabel = format === 'cd' ? 'דיסקים' : format === 'vinyl' ? 'תקליטים' : '';
    
    const searchTypeMap: Record<string, string> = {
      'name': 'שם כותרת או אמן',
      'title': 'שם כותרת',
      'artist': 'שם אמן',
      'tracklist': 'שמות הקטעים'
    };
    
    const searchTypeLabel = searchTypeMap[searchType] || 'שם כותרת או אמן';
    
    if (format === 'all') {
      return `חיפוש לפי ${searchTypeLabel}`;
    } else {
      return `חיפוש ${formatLabel} לפי ${searchTypeLabel}`;
    }
  };


  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchText('');
      setSearchType('name');
      setFormat('all');
    }
  }, [isOpen]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Enter key is handled by form onSubmit, but we can add explicit handling if needed
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleClear = () => {
    setSearchText('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!searchText.trim()) {
      return;
    }

    // Build navigation URL
    const selectedFormat = formatOptions.find(f => f.value === format);
    const path = selectedFormat?.path || '/all';
    
    const params = new URLSearchParams();
    params.set('search', searchText.trim());
    params.set('searchType', searchType);
    
    // Replace + with %20 for spaces (URLSearchParams uses + but we want %20)
    const url = `${path}?${params.toString().replace(/\+/g, '%20')}`;
    
    // Navigate and close overlay
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.searchOverlay}
      onClick={handleOverlayClick}
      dir="rtl"
    >
      <div className={styles.searchOverlayContent}>
        {/* Header */}
        <div className={styles.searchOverlayHeader}>
          <button 
            className={styles.searchOverlayCloseButton}
            onClick={onClose}
            aria-label="סגור"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className={styles.searchOverlayTitle}>חיפוש</h2>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className={styles.searchOverlayForm}>
          {/* Search Input */}
          <div className={styles.searchOverlayInputWrapper}>
            <input
              type="text"
              className={styles.searchOverlayInput}
              placeholder={getPlaceholder()}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
            {searchText && (
              <button
                type="button"
                className={styles.searchOverlayClearButton}
                onClick={handleClear}
                aria-label="נקה"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Scope Options */}
          <div className={styles.searchOverlaySection}>
            <h3 className={styles.searchOverlaySectionTitle}>חיפוש לפי</h3>
            <div className={styles.searchOverlayRadioGroup}>
              {searchTypeTags.map((tag) => (
                <label key={tag.value} className={styles.searchOverlayRadioLabel}>
                  <input
                    type="radio"
                    name="searchType"
                    value={tag.value}
                    checked={searchType === tag.value}
                    onChange={(e) => setSearchType(e.target.value)}
                    className={styles.searchOverlayRadioInput}
                  />
                  <span className={styles.searchOverlayRadioText}>{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className={styles.searchOverlaySection}>
            <h3 className={styles.searchOverlaySectionTitle}>פורמט</h3>
            <div className={styles.searchOverlayRadioGroup}>
              {formatOptions.map((option) => (
                <label key={option.value} className={styles.searchOverlayRadioLabel}>
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className={styles.searchOverlayRadioInput}
                  />
                  <span className={styles.searchOverlayRadioText}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.searchOverlaySubmitButton}
            disabled={!searchText.trim()}
          >
            <span>חיפוש</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchOverlay;

