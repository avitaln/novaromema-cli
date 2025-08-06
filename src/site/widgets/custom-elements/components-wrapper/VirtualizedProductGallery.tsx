import React, { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { CatalogAPI, type Product } from './api';
import styles from './element.module.css';

const FALLBACK_IMAGE = "https://static.wixstatic.com/media/614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png/v1/fill/w_260,h_260,al_c,q_85,enc_auto/a.jpg";

interface ProductCardProps {
  product: Product;
  style: React.CSSProperties;
}

function ProductCard({ product, style }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const imageUrl = useMemo(() => {
    if (!product.image || product.image.trim() === '' || imageError) {
      return FALLBACK_IMAGE;
    }
    return CatalogAPI.buildImageUrl(product.image);
  }, [product.image, imageError]);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div style={style}>
      <div className={styles.productCard}>
        <div className={styles.productImage}>
          <img 
            src={imageUrl} 
            alt={`${product.artist} - ${product.title}`}
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productArtist}>{product.artist}</h3>
          <p className={styles.productTitle}>{product.title}</p>
          <div className={styles.productPrice}>₪ {product.price.toFixed(2)}</div>
          <button className={styles.addToCartButton}>הוסף לסל</button>
        </div>
      </div>
    </div>
  );
}

interface VirtualizedProductGalleryProps {
  className?: string;
  height?: number;
}

export function VirtualizedProductGallery({ className, height = 500 }: VirtualizedProductGalleryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [containerWidth, setContainerWidth] = useState(1200);
  
  const gridRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const lastLoadedPageRef = useRef(0);
  const isScrollingRef = useRef(false);

  // Calculate responsive grid dimensions
  const gridConfig = useMemo(() => {
    const gap = 16;
    let columns = 5; // Default desktop
    
    if (containerWidth <= 768) {
      columns = 2; // Mobile
    } else if (containerWidth <= 1200) {
      columns = 4; // Tablet
    }
    
    const itemWidth = (containerWidth - (gap * (columns + 1))) / columns;
    const itemHeight = itemWidth * 1.4; // Card height ratio
    const rows = Math.ceil((products.length || 1) / columns);
    
    return {
      columns,
      rows,
      itemWidth: Math.floor(itemWidth),
      itemHeight: Math.floor(itemHeight),
      gap
    };
  }, [containerWidth, products.length]);

  // Track container width for responsive behavior
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const loadMoreProducts = useCallback(async (isInitial: boolean = false, forceLoad: boolean = false) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current && !forceLoad) {
      console.log('Already loading, skipping...');
      return;
    }
    
    if (!isInitial && !hasMore) {
      console.log('No more products to load');
      return;
    }

    const currentPage = Math.ceil(products.length / 25);
    const targetPage = isInitial ? 0 : currentPage;

    // Don't load the same page twice
    if (!isInitial && !forceLoad && targetPage <= lastLoadedPageRef.current) {
      console.log('Page already loaded:', targetPage);
      return;
    }

    console.log('Loading page:', targetPage, { isInitial, currentCount: products.length, hasMore });

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const offset = isInitial ? 0 : products.length;
      const response = await CatalogAPI.fetchProducts(offset, 25, isInitial);
      
      console.log('API Response:', { 
        productsReceived: response.products.length, 
        total: response.total,
        offset,
        page: targetPage
      });
      
      if (response.products.length === 0) {
        setHasMore(false);
        console.log('No products returned, marking as complete');
        return;
      }
      
      startTransition(() => {
        if (isInitial) {
          setProducts(response.products);
          lastLoadedPageRef.current = 0;
          if (response.total !== undefined) {
            setTotal(response.total);
          }
        } else {
          setProducts(prev => {
            // Prevent duplicates by checking if any of the new products already exist
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = response.products.filter(p => !existingIds.has(p.id));
            
            if (newProducts.length === 0) {
              console.log('All products already exist, marking as complete');
              setHasMore(false);
              return prev;
            }
            
            const updatedProducts = [...prev, ...newProducts];
            console.log('Added new products:', newProducts.length, 'Total:', updatedProducts.length);
            lastLoadedPageRef.current = targetPage;
            return updatedProducts;
          });
        }
        
        // Check if we have more products to load
        const newTotal = (isInitial ? 0 : products.length) + response.products.length;
        if (response.total && newTotal >= response.total) {
          setHasMore(false);
          console.log('Reached total products limit');
        } else if (response.products.length < 25) {
          setHasMore(false);
          console.log('Received less than 25 products, no more to load');
        }
      });
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [products.length, hasMore]);

  // Initial load
  useEffect(() => {
    loadMoreProducts(true);
  }, []);

  // Global scroll handler for natural scrolling
  useEffect(() => {
    const handleGlobalScroll = () => {
      if (!containerRef.current || !gridRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const windowHeight = window.innerHeight;

      // Check if container is in viewport
      if (containerBottom < 0 || containerTop > windowHeight) return;

      // Calculate scroll position relative to container
      const scrollProgress = Math.max(0, -containerTop) / (containerRect.height - windowHeight);
      const maxScrollTop = (gridConfig.rows * gridConfig.itemHeight) - height;
      const targetScrollTop = Math.max(0, Math.min(scrollProgress * maxScrollTop, maxScrollTop));

      // Apply scroll to grid
      if (gridRef.current) {
        isScrollingRef.current = true;
        gridRef.current.scrollTo({
          scrollTop: targetScrollTop,
          scrollLeft: 0
        });
        
        // Reset scrolling flag after a short delay
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 50);
      }

      // Trigger loading when near bottom
      if (scrollProgress > 0.8 && hasMore && !loadingRef.current) {
        console.log('Near bottom via global scroll, loading more...');
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleGlobalScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleGlobalScroll);
  }, [gridConfig, height, hasMore, loadMoreProducts]);

  // Grid cell renderer
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * gridConfig.columns + columnIndex;
    const product = products[index];
    
    if (!product) {
      // Render loading placeholder for empty cells at the end
      if (loading && hasMore && index < products.length + 10) {
        return (
          <div style={{
            ...style,
            left: (style.left as number) + gridConfig.gap / 2,
            top: (style.top as number) + gridConfig.gap / 2,
            width: (style.width as number) - gridConfig.gap,
            height: (style.height as number) - gridConfig.gap,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card-background)',
            borderRadius: '8px',
            border: '1px solid var(--card-border)'
          }}>
            <div className={styles.spinner}></div>
          </div>
        );
      }
      return null;
    }
    
    // Add gap to style
    const cellStyle = {
      ...style,
      left: (style.left as number) + gridConfig.gap / 2,
      top: (style.top as number) + gridConfig.gap / 2,
      width: (style.width as number) - gridConfig.gap,
      height: (style.height as number) - gridConfig.gap,
    };
    
    return <ProductCard product={product} style={cellStyle} />;
  };

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

  // Calculate total rows including potential loading rows
  const totalRows = Math.ceil((products.length + (loading && hasMore ? 10 : 0)) / gridConfig.columns);

  return (
    <div className={`${styles.productGallery} ${className || ''}`} ref={containerRef}>
      {total && (
        <div className={styles.totalProducts}>
          מציג {products.length} מתוך {total} מוצרים
        </div>
      )}
      
      <div className={styles.virtualizedContainer} style={{ height }}>
        <Grid
          ref={gridRef}
          columnCount={gridConfig.columns}
          columnWidth={gridConfig.itemWidth}
          height={height - 20}
          rowCount={totalRows}
          rowHeight={gridConfig.itemHeight}
          width={containerWidth}
          style={{
            overflow: 'hidden' // Hide scrollbar completely
          }}
        >
          {Cell}
        </Grid>
      </div>

      {(loading || isPending) && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>טוען מוצרים נוספים...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className={styles.endMessage}>
          <p>הצגת כל המוצרים ({products.length} מוצרים)</p>
        </div>
      )}

      {error && products.length > 0 && (
        <div className={styles.loadMoreError}>
          <p>שגיאה בטעינת מוצרים נוספים: {error}</p>
          <button 
            onClick={() => loadMoreProducts(false, true)}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
} 