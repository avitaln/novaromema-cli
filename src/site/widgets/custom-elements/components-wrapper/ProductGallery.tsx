import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { CatalogAPI, type PartialProduct } from './api';
import { ProductCard } from './ProductCard';
import styles from './element.module.css';

// Clear all existing caches on component load
const clearAllCaches = () => {
  // Clear all product gallery related caches
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('productGalleryCache') || key.includes('galleryScrollPosition'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  console.log('🧹 Cleared all gallery caches:', keysToRemove);
};

// Expose cache management functions globally for debugging
(window as any).productCacheUtils = {
  clearAllCaches
};

interface ProductGalleryProps {
  className?: string;
}

export function ProductGallery({ className }: ProductGalleryProps) {
  console.log('🖼️ ProductGallery component initialized');
  
  const [products, setProducts] = useState<PartialProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  
  // Get current path for route-based logic
  const currentPath = window.location.pathname;

  const handleImageClick = (product: PartialProduct) => {
    console.log('Product clicked:', product.id);
    
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
    // Dispatch custom event for add to cart
    const event = new CustomEvent('addToCart', {
      detail: { product },
      bubbles: true
    });
    document.dispatchEvent(event);
    console.log('Adding to cart:', product);
  };

  const loadMoreProducts = useCallback(async (isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    // Clear caches on initial load
    if (isInitial) {
      clearAllCaches();
    }

    // Get format filter based on current route
    const currentPath = window.location.pathname;
    let formats: string | undefined;
    if (currentPath === '/cd') {
      formats = '1';
    } else if (currentPath === '/vinyl') {
      formats = '2,3,4,5,6';
    }

    console.log('🔄 Loading products for route:', currentPath, 'with formats:', formats);

    setLoading(true);
    setError(null);

    try {
      const offset = isInitial ? 0 : products.length;
      const response = await CatalogAPI.fetchProducts(offset, 25, isInitial, formats);
      
      console.log('✅ Loaded products:', response.products.length, 'total available:', response.total);
      
      startTransition(() => {
        if (isInitial) {
          setProducts(response.products);
          if (response.total !== undefined) {
            setTotal(response.total);
          }
          setIsInitialLoad(false);
        } else {
          const newProducts = [...products, ...response.products];
          setProducts(newProducts);
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
      console.error('❌ Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [products.length, loading, hasMore, total]);

  // Initial load
  useEffect(() => {
    loadMoreProducts(true);
  }, []);

  // Reload when route changes
  useEffect(() => {
    if (!isInitialLoad) {
      console.log('🔄 Route changed to:', currentPath, 'reloading products...');
      // Clear existing products and reload for new format
      setProducts([]);
      setTotal(null);
      setHasMore(true);
      setIsScrollRestored(false);
      loadMoreProducts(true);
    }
  }, [currentPath]);

  // Simple scroll restoration (will be enhanced later)
  useEffect(() => {
    // For now, just scroll to top on route change
    if (!isInitialLoad) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentPath, isInitialLoad]);

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
            onClick={() => loadMoreProducts(true)}
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