import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PartialProduct } from './api';
import { ProductCard } from './ProductCard';
import { FilterBar } from './FilterBar';
import styles from './element.module.css';

interface FilterOptions {
  genre: string;
  special: string;
  condition: string;
  format: string;
  sort: string;
  search: string;
  searchType: string;
}

interface ProductGalleryProps {
  products: PartialProduct[];
  filters: FilterOptions;
  mode: 'all' | 'cd' | 'vinyl';
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
  mode,
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
      <FilterBar 
        mode={mode}
        total={total}
        initialFilters={filters}
        onFilterChange={onFiltersChange}
      />
      
      <div className={`${styles.productGrid} ${styles.productGridWithFilter}`}>
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