import React, { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import { CatalogAPI, type Product } from './api';
import styles from './element.module.css';

const FALLBACK_IMAGE = "https://static.wixstatic.com/media/614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png/v1/fill/w_260,h_260,al_c,q_85,enc_auto/a.jpg";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
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
  );
}

interface ProductGalleryProps {
  className?: string;
}

export function ProductGallery({ className }: ProductGalleryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMoreProducts = useCallback(async (isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;

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
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
        
        // Check if we have more products to load
        const newTotal = products.length + response.products.length;
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
      {total && (
        <div className={styles.totalProducts}>
          מציג {products.length} מתוך {total} מוצרים
        </div>
      )}
      
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
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