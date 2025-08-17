import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PartialProduct } from './api';
import { ProductCard } from './ProductCard';
import styles from './element.module.css';

interface FilterOptions {
  search: string;
  genres: string[];
  labels: string[];
  formats: string[];
  years: string[];
  priceRange: string;
  sort: string;
}

interface ProductGalleryProps {
  products: PartialProduct[];
  filters: FilterOptions;
  loading: boolean;
  error: string | null;
  total: number | null;
  hasMore: boolean;
  stopLoading: boolean;
  currentPage: number;
  scrollPosition: number;
  onProductClick: (product: PartialProduct) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onLoadMore: () => void;
  onNextPage: () => void;
  onScrollPositionChange: (position: number) => void;
}

export function ProductGallery({
  products,
  filters,
  loading,
  error,
  total,
  hasMore,
  stopLoading,
  currentPage,
  scrollPosition,
  onProductClick,
  onFiltersChange,
  onLoadMore,
  onNextPage,
  onScrollPositionChange
}: ProductGalleryProps) {
  console.log('🖼️ ProductGallery component initialized');
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef<boolean>(false); // Track if load is already in progress
  const queuedLoadRef = useRef<boolean>(false); // Queue additional loads instead of blocking
  const lastScrollEventRef = useRef<number>(0); // Light throttle to avoid excessive calls
  const MAX_INFINITE_SCROLL_PRODUCTS = 500;

  // Get current path for route-based logic
  const currentPath = window.location.pathname;

  // Filter Header Component
  const FilterHeader = () => {
    // Genre options in correct order with English labels
    const genres = [
      'Israeli',
      'Rock/Pop', 
      'Alternative Rock',
      'New Wave/Post Punk/Gothic',
      'Jazz/Blues',
      'Soul/Funk',
      'Electronic',
      'Trance',
      'Experimental/Industrial/Noise',
      'Hip Hop',
      'Reggae/Dub',
      'Hardcore/Punk',
      'Metal',
      'Doom/Sludge/Stoner',
      'Prog/Psychedelic',
      'Folk/Country',
      'World',
      'Classical',
      'Soundtracks'
    ];
    const labels = ['אד נוחים', 'EMI', 'Sony', 'Warner', 'Universal', 'Indie'];
    const formatOptions = ['LP', 'CD', 'Cassette', 'Digital'];
    const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];
    const priceRanges = ['עד 50 ש"ח', '50-100 ש"ח', '100-150 ש"ח', '150+ ש"ח'];
    const sortOptions = ['הכי חדש', 'מחיר נמוך לגבוה', 'מחיר גבוה לנמוך', 'לפי אמן', 'לפי כותרת'];

    const handleFiltersChange = (updatedFilters: Partial<FilterOptions>) => {
      onFiltersChange({ ...filters, ...updatedFilters });
    };

    return (
      <div className={styles.filterHeader}>
        <div className={styles.filterContainer}>
          {/* Search */}
          <div className={styles.filterItem}>
            <input
              type="text"
              placeholder="חיפוש במוצרים..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              className={styles.searchInput}
            />
          </div>

          {/* Genres Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.genres.includes(value)) {
                  handleFiltersChange({ genres: [...filters.genres, value] });
                }
              }}
            >
              <option value="">Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Labels Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.labels.includes(value)) {
                  handleFiltersChange({ labels: [...filters.labels, value] });
                }
              }}
            >
              <option value="">חברות הקלטות</option>
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {/* Formats Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.formats.includes(value)) {
                  handleFiltersChange({ formats: [...filters.formats, value] });
                }
              }}
            >
              <option value="">סוג</option>
              {formatOptions.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          {/* Years Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.years.includes(value)) {
                  handleFiltersChange({ years: [...filters.years, value] });
                }
              }}
            >
              <option value="">שנים</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              value={filters.priceRange}
              onChange={(e) => handleFiltersChange({ priceRange: e.target.value })}
            >
              <option value="">טווח מחירים</option>
              {priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              value={filters.sort}
              onChange={(e) => handleFiltersChange({ sort: e.target.value })}
            >
              <option value="">מיון</option>
              {sortOptions.map(sort => (
                <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className={styles.resultsCount}>
            מציג {total} {currentPath === '/vinyl' ? 'תקליטים' : currentPath === '/cd' ? 'דיסקים' : 'תקליטים ודיסקים'}
          </div>
        </div>
        
        {/* Active Filters */}
        <div className={styles.activeFilters}>
          {filters.genres.map(genre => (
            <span key={genre} className={styles.filterTag}>
              {genre}
              <button 
                onClick={() => handleFiltersChange({ genres: filters.genres.filter(g => g !== genre) })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.labels.map(label => (
            <span key={label} className={styles.filterTag}>
              {label}
              <button 
                onClick={() => handleFiltersChange({ labels: filters.labels.filter(l => l !== label) })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.formats.map(format => (
            <span key={format} className={styles.filterTag}>
              {format}
              <button 
                onClick={() => handleFiltersChange({ formats: filters.formats.filter(f => f !== format) })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.years.map(year => (
            <span key={year} className={styles.filterTag}>
              {year}
              <button 
                onClick={() => handleFiltersChange({ years: filters.years.filter(y => y !== year) })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.priceRange && (
            <span className={styles.filterTag}>
              {filters.priceRange}
              <button 
                onClick={() => handleFiltersChange({ priceRange: '' })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          )}
          {filters.sort && (
            <span className={styles.filterTag}>
              מיון: {filters.sort}
              <button 
                onClick={() => handleFiltersChange({ sort: '' })}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleImageClick = (product: PartialProduct) => {
    console.log('Product clicked:', product.id);
    // Save scroll position before navigating away
    onScrollPositionChange(window.scrollY);
    onProductClick(product);
  };

  const handleAddToCart = (product: PartialProduct) => {
    // Dispatch custom event for add to cart
    const event = new CustomEvent('addToCart', {
      detail: { product },
      bubbles: true
    });
    document.dispatchEvent(event);
    console.log('Adding to cart:', product);
  };

  // Scroll handler with queue-based loading instead of throttling/blocking
  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    // Very light throttling - just to avoid excessive calls per frame
    if (now - lastScrollEventRef.current < 16) return; // ~60fps
    lastScrollEventRef.current = now;
    
      if (!galleryRef.current || stopLoading || !hasMore) return;
    
    // Use document height approach for more reliable detection
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if we're within 500px of bottom
    if (scrollTop + windowHeight > documentHeight - 500 && products.length < MAX_INFINITE_SCROLL_PRODUCTS) {
      if (isLoadingMoreRef.current) {
        // Already loading - queue another load instead of blocking
        if (!queuedLoadRef.current) {
          console.log('📋 Queueing load more request - currently loading (scroll:', scrollTop, 'products:', products.length, ')');
          queuedLoadRef.current = true;
        }
      } else {
        // Not loading - trigger immediate load
        console.log('📄 Infinite scroll triggered at scroll position:', scrollTop, 'products:', products.length);
        isLoadingMoreRef.current = true;
        onLoadMore();
      }
    } else if (queuedLoadRef.current && (scrollTop + windowHeight <= documentHeight - 500)) {
      // User scrolled away from bottom while queue was active - cancel queue
      console.log('❌ Canceling queued load - user scrolled away from bottom');
      queuedLoadRef.current = false;
    }
  }, [products.length, stopLoading, hasMore, onLoadMore]);

  // Process queue when loading completes
  useEffect(() => {
    if (!loading && isLoadingMoreRef.current) {
      console.log('✅ Loading completed');
      isLoadingMoreRef.current = false;
      
      // Check if there's a queued load request
      if (queuedLoadRef.current) {
        console.log('🔄 Processing queued load request');
        queuedLoadRef.current = false;
        
        // Small delay to ensure state is settled, then check if we still need to load
        setTimeout(() => {
          // Re-check scroll position to see if we still need more content
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          
          if (scrollTop + windowHeight > documentHeight - 500 && 
              products.length < MAX_INFINITE_SCROLL_PRODUCTS && 
              hasMore && !stopLoading) {
            console.log('✨ Executing queued load - still at bottom');
            isLoadingMoreRef.current = true;
            onLoadMore();
          } else {
            console.log('🚫 Skipping queued load - no longer needed');
          }
        }, 100);
      }
    }
  }, [loading, products.length, hasMore, stopLoading, onLoadMore]);

  // Clear flags when component unmounts or no more data available
  useEffect(() => {
    return () => {
      // Clear flags on unmount
      isLoadingMoreRef.current = false;
      queuedLoadRef.current = false;
    };
  }, []);

  // Clear flags when no more data available
  useEffect(() => {
    if (!hasMore) {
      if (isLoadingMoreRef.current || queuedLoadRef.current) {
        console.log('🔄 Clearing flags - no more data available');
        isLoadingMoreRef.current = false;
        queuedLoadRef.current = false;
      }
    }
  }, [hasMore]);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Note: Scroll restoration is handled by parent element.tsx when navigating back from product page

  if (error && products.length === 0) {
    return (
      <div className={styles.productGallery}>
        <div className={styles.error}>
          <p>שגיאה בטעינת המוצרים: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={galleryRef} className={styles.productGallery}>
      <FilterHeader />
      
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onImageClick={handleImageClick}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>טוען מוצרים...</p>
        </div>
      )}

      {/* Next page button - show when we have exactly the page limit and not stopped loading */}
      {products.length === MAX_INFINITE_SCROLL_PRODUCTS && !stopLoading && (
        <div className={styles.paginationButton}>
          <button onClick={onNextPage} className={styles.nextPageButton}>
            לדף {currentPage + 2} &gt;
          </button>
        </div>
      )}

      {/* Error handling */}
      {error && products.length > 0 && (
        <div className={styles.loadMoreError}>
          <p>שגיאה בטעינת מוצרים נוספים: {error}</p>
          <button 
            onClick={onLoadMore}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
};