import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './element.module.css';

// Constants from reference implementation
const conditionTags = [
  { "value": "all", "label": "הכל" },
  { "value": "new", "label": "חדש" },
  { "value": "used", "label": "יד שניה" }
];

const formatAllTags = [
  { "value": "all", "label": "הכל" },
  { "value": "cd", "label": "CD" },
  { "value": "lp", "label": "LP" },
  { "value": "12", "label": "12\"" },
  { "value": "10", "label": "10\"" },
  { "value": "7", "label": "7\"" },
  { "value": "cassette", "label": "Cassette" }
];

const formatCdTags = [
  { "value": "cd", "label": "CD" }
];

const formatVinylTags = [
  { "value": "all", "label": "הכל" },
  { "value": "lp", "label": "LP" },
  { "value": "12", "label": "12\"" },
  { "value": "10", "label": "10\"" },
  { "value": "7", "label": "7\"" },
  { "value": "cassette", "label": "Cassette" }
];

const genreTags = [
  { "value": "all", "label": "הכל" },
  { "value": "israeli", "label": "Israeli" },
  { "value": "rock-pop", "label": "Rock/Pop" },
  { "value": "alternative-rock", "label": "Alternative Rock" },
  { "value": "newwave-postpunk-gothic", "label": "New Wave/Post Punk/Gothic" },
  { "value": "jazz-blues", "label": "Jazz/Blues" },
  { "value": "soul-funk", "label": "Soul/Funk" },
  { "value": "electronic", "label": "Electronic" },
  { "value": "trance", "label": "Trance" },
  { "value": "experimental-industrial-noise", "label": "Experimental/Industrial/Noise" },
  { "value": "hip-hop", "label": "Hip Hop" },
  { "value": "reggae-dub", "label": "Reggae/Dub" },
  { "value": "hardcore-punk", "label": "Hardcore/Punk" },
  { "value": "metal", "label": "Metal" },
  { "value": "doom-sludge-stoner", "label": "Doom/Sludge/Stoner" },
  { "value": "prog-psychedelic", "label": "Prog/Psychedelic" },
  { "value": "folk-country", "label": "Folk/Country" },
  { "value": "world", "label": "World" },
  { "value": "classical", "label": "Classical" },
  { "value": "soundtracks", "label": "Soundtracks" },
];

const specialTags = [
  { "value": "all", "label": "הכל" },
  { "value": "newinsite", "label": "חדש באתר" },
  { "value": "preorder", "label": "הזמנות מוקדמות" },
  { "value": "recommended", "label": "המלצות" },
  { "value": "classics", "label": "קלאסיקות" },
  { "value": "floor", "label": "מחירי רצפה" }, 
  { "value": "rare", "label": "נדירים" }
];

const sortTags = [
  { "value": "new",      "label": "חדש באתר" },
  { "value": "pricelow", "label": "מחיר - מהנמוך לגבוה" },
  { "value": "pricehigh",  "label": "מחיר - מהגבוה לנמוך" },
  { "value": "title",     "label": "שם כותר" },
  { "value": "artist",     "label": "שם האמן" }
];

const searchTypeTags = [
  { "value": "name", "label": "כותרת ואמן" },
  { "value": "title", "label": "רק כותרת" },
  { "value": "artist", "label": "רק אמן" }
];

interface FilterState {
  genre: string;
  special: string;
  condition: string;
  format: string;
  sort: string;
  search: string;
  searchType: string;
}

interface FilterBarProps {
  mode: 'all' | 'cd' | 'vinyl'; // Current page mode
  total: number | null;
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ mode, total, initialFilters, onFilterChange }: FilterBarProps) {
  // Initialize state based on reference implementation
  const [filters, setFilters] = useState<FilterState>({
    genre: "all",
    special: "all", 
    condition: "all",
    format: "all",
    sort: "new",
    search: "",
    searchType: "name",
    ...initialFilters
  });

  // Sync with parent filters when they change (e.g., from URL params or external updates)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => {
        const newFilters = { ...prev, ...initialFilters };
        // Only update if there are actual changes to avoid unnecessary re-renders
        const hasChanges = Object.keys(initialFilters).some(key => 
          prev[key as keyof FilterState] !== initialFilters[key as keyof FilterState]
        );
        return hasChanges ? newFilters : prev;
      });
    }
  }, [initialFilters]);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastQueryBodyRef = useRef<string>('');

  // Get format options based on mode
  const getFormatTags = () => {
    switch (mode) {
      case 'cd':
        return formatCdTags;
      case 'vinyl':
        return formatVinylTags;
      default:
        return formatAllTags;
    }
  };

  // Get item type label for results count
  const getItemType = () => {
    switch (mode) {
      case 'cd':
        return 'דיסקים';
      case 'vinyl':
        return 'תקליטים';
      default:
        return 'כותרים';
    }
  };

  // Get selected label for dropdown
  const getSelectedLabel = (tagKey: keyof FilterState, tags: Array<{value: string, label: string}>) => {
    const selectedTag = tags.find(tag => tag.value === filters[tagKey]);
    return selectedTag ? selectedTag.label : tags[0].label;
  };

  // Check if filter is in default state
  const isDefault = (tagKey: keyof FilterState) => {
    return filters[tagKey] === 'all' || (filters[tagKey] === 'new' && tagKey === 'sort') || (filters[tagKey] === 'name' && tagKey === 'searchType');
  };

  // Build query body from filters for comparison
  const buildQueryBody = useCallback((filters: FilterState) => {
    // Create a normalized query object that represents the actual API call
    const queryBody = {
      genre: filters.genre,
      special: filters.special,
      condition: filters.condition,
      format: filters.format,
      sort: filters.sort,
      // Only include search fields if there's actual search text
      ...(filters.search.trim() !== '' && {
        search: filters.search.trim(),
        searchType: filters.searchType
      })
    };
    return JSON.stringify(queryBody);
  }, []);

  // Handle filter changes with query body comparison
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Build query body from new filters
      const newQueryBody = buildQueryBody(newFilters);
      
      // Only trigger API call if query body actually changed
      if (newQueryBody !== lastQueryBodyRef.current) {
        lastQueryBodyRef.current = newQueryBody;
        onFilterChange(newFilters);
      }
      
      return newFilters;
    });
  }, [onFilterChange, buildQueryBody]);

  // Handle search with debounce
  const handleSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setFilters(prev => ({ ...prev, search: value }));
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new debounced timeout - use functional update to get fresh state
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(currentFilters => {
        const newFilters = { ...currentFilters, search: value };
        
        // Build query body from new filters
        const newQueryBody = buildQueryBody(newFilters);
        
        // Always trigger API call for search changes (search is user-driven)
        lastQueryBodyRef.current = newQueryBody;
        onFilterChange(newFilters);
        
        return currentFilters; // Don't change state, just trigger callback
      });
    }, 1000); // 1 second debounce like in reference
  }, [onFilterChange, buildQueryBody]);

  // Initialize lastQueryBodyRef with current filters (after buildQueryBody is defined)
  useEffect(() => {
    const initialQueryBody = buildQueryBody(filters);
    lastQueryBodyRef.current = initialQueryBody;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);



  return (
    <div className={styles.filterBarContainer}>
      
      {/* Desktop Layout with 3 Column Containers */}
      <div className={`${styles.filterBar} ${styles.onlydesktop}`}>
        
        {/* Column 1: Results + Format/Genre */}
        <div className={styles.desktopColumn}>
          <div className={styles.resultsCount}>
            <span className={styles.resultsLabel}>
              מציג {total || 0} {getItemType()}
            </span>
          </div>
          
          {/* Format dropdown - only show on vinyl page */}
          {mode === 'vinyl' && (
            <div className={styles.filterDropdown}>
              <div className={styles.dropdownContainer}>
                <label className={styles.dropdownLabel}>פורמט</label>
                <div className={styles.dropdownWrapper}>
                  <select 
                    className={styles.dropdownSelect}
                    value={filters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                  >
                    {getFormatTags().map(tag => (
                      <option key={tag.value} value={tag.value}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                  <div className={`${styles.dropdownButton} ${!isDefault('format') ? styles.active : ''}`}>
                    {getSelectedLabel('format', getFormatTags())}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Genre dropdown */}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>ז'אנר</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  {genreTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('genre') ? styles.active : ''}`}>
                  {getSelectedLabel('genre', genreTags)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Condition + Special + Sort */}
        <div className={styles.desktopColumn}>
          {/* Condition dropdown */}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>מצב</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  {conditionTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('condition') ? styles.active : ''}`}>
                  {getSelectedLabel('condition', conditionTags)}
                </div>
              </div>
            </div>
          </div>

          {/* Special categories dropdown */}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>קטגוריות מיוחדות</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.special}
                  onChange={(e) => handleFilterChange('special', e.target.value)}
                >
                  {specialTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('special') ? styles.active : ''}`}>
                  {getSelectedLabel('special', specialTags)}
                </div>
              </div>
            </div>
          </div>

          {/* Sort dropdown */}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>מיון לפי</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {sortTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('sort') ? styles.active : ''}`}>
                  {getSelectedLabel('sort', sortTags)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Search + Search Type */}
        <div className={styles.desktopColumn}>
          {/* Desktop search box */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="חיפוש בתוצאות"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Desktop search type dropdown */}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>לפי</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.searchType}
                  onChange={(e) => handleFilterChange('searchType', e.target.value)}
                >
                  {searchTypeTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('searchType') ? styles.active : ''}`}>
                  {getSelectedLabel('searchType', searchTypeTags)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout with Row Containers */}
      <div className={`${styles.mobileFilterGrid} ${styles.onlymobile}`}>
        
        {/* Row 1: Results + Search + Search Type */}
        <div className={`${styles.mobileRow} ${styles.mobileRow1}`}>
          <div className={styles.resultsCount}>
            <span className={styles.resultsLabel}>
              מציג {total || 0} {getItemType()}
            </span>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="חיפוש בתוצאות"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>לפי</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.searchType}
                  onChange={(e) => handleFilterChange('searchType', e.target.value)}
                >
                  {searchTypeTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('searchType') ? styles.active : ''}`}>
                  {getSelectedLabel('searchType', searchTypeTags)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Format + Genre + Condition */}
        <div className={`${styles.mobileRow} ${styles.mobileRow2}`}>
          {mode === 'vinyl' && (
            <div className={styles.filterDropdown}>
              <div className={styles.dropdownContainer}>
                <label className={styles.dropdownLabel}>פורמט</label>
                <div className={styles.dropdownWrapper}>
                  <select 
                    className={styles.dropdownSelect}
                    value={filters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                  >
                    {getFormatTags().map(tag => (
                      <option key={tag.value} value={tag.value}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                  <div className={`${styles.dropdownButton} ${!isDefault('format') ? styles.active : ''}`}>
                    {getSelectedLabel('format', getFormatTags())}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>ז'אנר</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  {genreTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('genre') ? styles.active : ''}`}>
                  {getSelectedLabel('genre', genreTags)}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>מצב</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  {conditionTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('condition') ? styles.active : ''}`}>
                  {getSelectedLabel('condition', conditionTags)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Special + Sort */}
        <div className={`${styles.mobileRow} ${styles.mobileRow3}`}>
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>קטגוריות מיוחדות</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.special}
                  onChange={(e) => handleFilterChange('special', e.target.value)}
                >
                  {specialTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('special') ? styles.active : ''}`}>
                  {getSelectedLabel('special', specialTags)}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.filterDropdown}>
            <div className={styles.dropdownContainer}>
              <label className={styles.dropdownLabel}>מיון לפי</label>
              <div className={styles.dropdownWrapper}>
                <select 
                  className={styles.dropdownSelect}
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {sortTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <div className={`${styles.dropdownButton} ${!isDefault('sort') ? styles.active : ''}`}>
                  {getSelectedLabel('sort', sortTags)}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
