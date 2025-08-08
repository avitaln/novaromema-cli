import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { CatalogAPI, type PartialProduct } from './api';
import { ProductCard } from './ProductCard';
import styles from './element.module.css';

// Global state for product cache
interface ProductCache {
  products: PartialProduct[];
  total: number | null;
  hasMore: boolean;
  lastOffset: number;
}

const CACHE_KEY = 'productGalleryCache';
let globalProductCache: ProductCache | null = null;

// Helper functions for cache management
const saveToCache = (cache: ProductCache) => {
  globalProductCache = { ...cache };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const loadFromCache = (): ProductCache | null => {
  if (globalProductCache) {
    return globalProductCache;
  }
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      globalProductCache = JSON.parse(cached);
      return globalProductCache;
    }
  } catch (error) {
    console.warn('Failed to load product cache:', error);
  }
  return null;
};

const clearCache = () => {
  globalProductCache = null;
  sessionStorage.removeItem(CACHE_KEY);
};

// Expose cache management functions globally for debugging
(window as any).productCacheUtils = {
  clearCache,
  loadFromCache,
  getCache: () => globalProductCache
};

interface ProductGalleryProps {
  className?: string;
}

export function ProductGallery({ className }: ProductGalleryProps) {
  const [products, setProducts] = useState<PartialProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  
  // Pre-check if we need to restore scroll to avoid flickering
  const shouldRestoreScroll = !isInitialLoad && !isScrollRestored && sessionStorage.getItem('galleryScrollPosition');

  const handleImageClick = (product: PartialProduct) => {
    console.log('Product clicked:', product.id);
    
    // Save current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('galleryScrollPosition', scrollPosition.toString());
    
    // Save current state to cache
    saveToCache({
      products,
      total,
      hasMore,
      lastOffset: products.length
    });
    
    // Navigate to product page
    window.history.pushState({}, '', `/product/${product.id}`);
    
    // Trigger router by calling it directly since pushState doesn't trigger popstate
    if ((window as any).router) {
      (window as any).router();
    } else {
      // Fallback: dispatch custom event
      const event = new CustomEvent('navigate');
      window.dispatchEvent(event);
    }
  };

  const handleAddToCart = (product: PartialProduct) => {
    // Update cache when product is modified (if needed)
    saveToCache({
      products,
      total,
      hasMore,
      lastOffset: products.length
    });
    
    // Dispatch custom event for add to cart
    const event = new CustomEvent('addToCart', {
      detail: { product },
      bubbles: true
    });
    document.dispatchEvent(event);
    console.log('Adding to cart:', product);
  };

  const loadMoreProducts = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    // Check cache on initial load
    if (isInitial && !forceRefresh) {
      const cachedData = loadFromCache();
      if (cachedData && cachedData.products.length > 0) {
        console.log('Loading products from cache:', cachedData.products.length, 'products');
        startTransition(() => {
          setProducts(cachedData.products);
          setTotal(cachedData.total);
          setHasMore(cachedData.hasMore);
          // Set initial load to false after a small delay to ensure proper rendering
          setTimeout(() => setIsInitialLoad(false), 50);
        });
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const offset = isInitial ? 0 : products.length;
      const response = await CatalogAPI.fetchProducts(offset, 25, isInitial);
      
      startTransition(() => {
        if (isInitial) {
          setProducts(response.products);
          if (response.total !== undefined) {
            setTotal(response.total);
          }
          setIsInitialLoad(false);
          
          // Save initial load to cache
          saveToCache({
            products: response.products,
            total: response.total || null,
            hasMore: response.products.length >= 25,
            lastOffset: response.products.length
          });
        } else {
          const newProducts = [...products, ...response.products];
          setProducts(newProducts);
          
          // Update cache with new products
          saveToCache({
            products: newProducts,
            total,
            hasMore: response.products.length >= 25,
            lastOffset: newProducts.length
          });
        }
        
        // Check if we have more products to load
        const newTotal = (isInitial ? 0 : products.length) + response.products.length;
        if (total && newTotal >= total) {
          setHasMore(false);
        } else if (response.products.length < 25) {
          setHasMore(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [products.length, loading, hasMore, total]);

  // Initial load
  useEffect(() => {
    loadMoreProducts(true);
  }, []);

  // Restore scroll position after products are loaded and rendered
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('galleryScrollPosition');
    if (savedScrollPosition && products.length > 0 && shouldRestoreScroll) {
      const scrollPosition = parseInt(savedScrollPosition, 10);
      console.log('🔄 Starting scroll restoration to position:', scrollPosition);
      
      // Wait for DOM to render and images to load
      const restoreScroll = () => {
        // Use double requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'auto'
            });
            sessionStorage.removeItem('galleryScrollPosition');
            setIsScrollRestored(true);
            console.log('✅ Scroll position restored to:', scrollPosition);
          });
        });
      };

      // Wait for images to load or timeout after 500ms (reduced timeout)
      const images = document.querySelectorAll(`.${styles.productGrid} img`);
      if (images.length === 0) {
        restoreScroll();
        return;
      }

      let loadedImages = 0;
      let timeoutId: number;
      
      const checkComplete = () => {
        loadedImages++;
        if (loadedImages >= Math.min(images.length, 6)) { // Reduced to 6 images
          clearTimeout(timeoutId);
          restoreScroll();
        }
      };

      // Timeout for restoration with visible effect
      timeoutId = window.setTimeout(() => {
        restoreScroll();
      }, 800);

      // Listen for image loads
      images.forEach((img, index) => {
        if (index < 6) { // Only check first 6 images
          const imgElement = img as HTMLImageElement;
          if (imgElement.complete) {
            checkComplete();
          } else {
            imgElement.addEventListener('load', checkComplete, { once: true });
            imgElement.addEventListener('error', checkComplete, { once: true });
          }
        }
      });
    }
  }, [products, shouldRestoreScroll]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  if (error && products.length === 0) {
    return (
      <div className={`${styles.productGallery} ${className || ''}`}>
        <div className={styles.error}>
          <p>שגיאה בטעינת המוצרים: {error}</p>
          <button 
            onClick={() => loadMoreProducts(true, true)}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.productGallery} ${className || ''}`}>
      <div 
        className={styles.productGrid}
        style={{
          opacity: shouldRestoreScroll ? 0.1 : 1,
          transform: shouldRestoreScroll ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
          filter: shouldRestoreScroll ? 'blur(2px)' : 'blur(0)'
        }}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onImageClick={handleImageClick}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Show loading overlay during scroll restoration */}
      {shouldRestoreScroll && (
        <div className={styles.scrollRestorationOverlay}>
          <div className={styles.spinner}></div>
          <p>משחזר מיקום...</p>
        </div>
      )}

      {(loading || isPending) && (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>טוען מוצרים...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className={styles.endMessage}>
          <p>הצגת כל המוצרים</p>
        </div>
      )}

      {error && products.length > 0 && (
        <div className={styles.loadMoreError}>
          <p>שגיאה בטעינת מוצרים נוספים: {error}</p>
          <button 
            onClick={() => loadMoreProducts()}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
} 