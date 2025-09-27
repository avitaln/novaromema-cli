import React, { useEffect, useMemo, useState } from 'react';
import { CatalogAPI, type FullProduct } from './api';
import styles from './element.module.css';

interface ProductPageProps {
  product: FullProduct | null;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
  onAddToCart?: (product: FullProduct) => void;
  onAddToWishlist?: (product: FullProduct) => void;
}

export function ProductPage({ product, loading, error, onClose, onAddToCart, onAddToWishlist }: ProductPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Scroll to top when component mounts instantly
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset image loading state when product changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [product?.id]);

  const imageUrl = useMemo(() => {
    if (!product?.image) return '';
    return CatalogAPI.buildImageUrl(product.image, 500, 500);
  }, [product?.image]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Navigate back to gallery
      window.history.pushState({}, '', '/gallery');
      if ((window as any).router) {
        (window as any).router();
      } else {
        const event = new PopStateEvent('popstate');
        window.dispatchEvent(event);
      }
    }
  };

  const handleAddToCart = () => {
    if (product && onAddToCart && (product.inventory === undefined || product.inventory > 0)) {
      onAddToCart(product);
    }
  };

  const isOutOfStock = product?.inventory !== undefined && product.inventory <= 0;

  const handleAddToWishlist = () => {
    if (product && onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent, action: 'close' | 'cart' | 'wishlist') => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (action === 'close') {
        handleClose();
      } else if (action === 'cart') {
        handleAddToCart();
      } else if (action === 'wishlist') {
        handleAddToWishlist();
      }
    }
  };

  const formatReleaseDate = (released: number) => {
    if (!released || released === 0) return '';
    const date = new Date(released);
    return date.toLocaleDateString('he-IL', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.productPageContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>טוען מוצר...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.productPageContainer}>
        <div className={styles.error}>
          <p>שגיאה בטעינת המוצר: {error}</p>
          <button onClick={handleClose} className={styles.retryButton}>
            חזור
          </button>
        </div>
      </div>
    );
  }

  const renderDescription = (html: string) => {
    return { __html: html };
  };

  return (
    <div className={styles.productPageContainer}>
      <div className={styles.mainPopup}>
        <div className={styles.imageCont}>
          {!imageLoaded && !imageError && imageUrl && (
            <div className={styles.imageSkeletonPopup}></div>
          )}
          <img 
            className={`${styles.imagePopup} ${imageLoaded ? styles.imageLoaded : styles.imageLoading} ${imageError ? styles.imageError : ''}`}
            src={imageUrl} 
            alt={`${product.artist} - ${product.title}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageError && (
            <div className={styles.imagePlaceholderPopup}>
              <span>תמונה לא זמינה</span>
            </div>
          )}
        </div>
        
        <div className={styles.detailsCont}>
          <h1 className={styles.productPageMainTitle}>{`${product.artist} - ${product.title}${product.shortFormat ? ` (${product.shortFormat})` : ''}`}</h1>
          
          <div className={styles.priceTextBig}>{product.price?.toFixed(2) ?? '0.00'} ₪</div>
          
          {/* Inventory status */}
          {product.inventory !== undefined && product.inventory <= 0 && (
            <div className={styles.outOfStock}>
              <span className={styles.outOfStockText}>אזל מהמלאי</span>
            </div>
          )}
          
          <div><span className={styles.label}>Artist:</span> {product.artist}</div>
          <div><span className={styles.label}>Title:</span> {product.title}</div>
          {product.label ? <div><span className={styles.label}>Label:</span> {product.label}</div> : <div></div>}
          {product.metadata?.format ? <div><span className={styles.label}>Format:</span> {product.metadata.format}</div> : <div></div>}
          {product.country ? <div><span className={styles.label}>Country:</span> {product.country}</div> : <div></div>}
          {product.released && product.released !== 0 ? <div><span className={styles.label}>Released:</span> {formatReleaseDate(product.released)}</div> : <div></div>}

          {(product.metadata?.media || product.metadata?.sleeve) && <h3>Condition</h3>}
          {product.metadata?.media ? <div><span className={styles.label}>Media:</span> {product.metadata.media}</div> : <div></div>}
          {product.metadata?.sleeve ? <div><span className={styles.label}>Sleeve:</span> {product.metadata.sleeve}</div> : <div></div>}

          {product.metadata?.genres && product.metadata.genres.length > 0 && <h3>Genres</h3>}
          {product.metadata?.genres && product.metadata.genres.length > 0 && <div>{product.metadata.genres.join(', ')}</div>}

          {product.metadata?.styles && product.metadata.styles.length > 0 && <h3>Styles</h3>}
          {product.metadata?.styles && product.metadata.styles.length > 0 && <div>{product.metadata.styles.join(', ')}</div>}

          {product.metadata?.comments && <h3>Comments</h3>}
          {product.metadata?.comments && <div>{product.metadata.comments}</div>}

          <div></div> {/* Empty grid cell for spacing above button */}
          
          <div 
            role="button" 
            className={`${styles.btn} ${styles.btnPriceBig} ${isOutOfStock ? styles.btnDisabled : ''}`}
            tabIndex={isOutOfStock ? -1 : 0}
            onClick={isOutOfStock ? undefined : handleAddToCart}
            onKeyUp={isOutOfStock ? undefined : (e) => handleKeyUp(e, 'cart')}
            style={{ 
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {isOutOfStock ? 'אזל מהמלאי' : 'הוספה לסל'}
          </div>
          


          {(product.metadata?.trackList || product.desctracklist) && <h3>Tracklist</h3>}
          {(product.metadata?.trackList || product.desctracklist) && (
            <div dangerouslySetInnerHTML={renderDescription(product.metadata?.trackList || product.desctracklist || '')} />
          )}

          <div 
            className={`${styles.btn} ${styles.btnClose}`}
            role="button" 
            tabIndex={0} 
            onClick={handleClose}
            onKeyUp={(e) => handleKeyUp(e, 'close')}
          >
            ✕
          </div>
        </div>
      </div>
    </div>
  );
}
