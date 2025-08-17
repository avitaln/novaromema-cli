import React, { useEffect, useMemo } from 'react';
import { CatalogAPI, type FullProduct } from './api';
import styles from './element.module.css';

interface ProductPageProps {
  product: FullProduct | null;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
  onAddToCart?: (product: FullProduct) => void;
}

export function ProductPage({ product, loading, error, onClose, onAddToCart }: ProductPageProps) {

  // Scroll to top when component mounts
  useEffect(() => {
    // Use simple scroll method that doesn't interfere with smooth scrolling
    window.scrollTo(0, 0);
  }, []);

  const imageUrl = useMemo(() => {
    if (!product?.image) return '';
    return CatalogAPI.buildImageUrl(product.image, 500, 500);
  }, [product?.image]);

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
    if (product && onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent, action: 'close' | 'cart') => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (action === 'close') {
        handleClose();
      } else if (action === 'cart') {
        handleAddToCart();
      }
    }
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
          <img 
            className={styles.imagePopup} 
            src={imageUrl} 
            alt={`${product.artist} - ${product.title}`}
          />
        </div>
        
        <div className={styles.detailsCont}>
          <div className={styles.namePanelPopup}>
            <h2>{`${product.artist} - ${product.title}`}</h2>
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
          
          <a className={styles.priceTextBig}>₪{product.price?.toFixed(2) ?? '0.00'}</a>
          
          {product.descmain && (
            <p dangerouslySetInnerHTML={renderDescription(product.descmain)} />
          )}
          
          <div 
            role="button" 
            className={`${styles.btn} ${styles.btnPriceBig}`}
            tabIndex={0}
            onClick={handleAddToCart}
            onKeyUp={(e) => handleKeyUp(e, 'cart')}
          >
            הוספה לסל
          </div>
          
          {product.desctracklist && (
            <p>
              <h3>Track List</h3>
              <span dangerouslySetInnerHTML={renderDescription(product.desctracklist)} />
            </p>
          )}
          
          {product.descnotes && (
            <p>
              <h3>Notes</h3>
              <span dangerouslySetInnerHTML={renderDescription(product.descnotes)} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
