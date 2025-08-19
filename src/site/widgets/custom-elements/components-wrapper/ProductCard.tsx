import React, { useState, useMemo } from 'react';
import { CatalogAPI, type PartialProduct } from './api';
import styles from './element.module.css';

interface ProductCardProps {
  product: PartialProduct;
  onImageClick?: (product: PartialProduct) => void;
  onAddToCart?: (product: PartialProduct) => void;
}

export function ProductCard({ product, onImageClick, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageUrl = useMemo(() => {
    return CatalogAPI.buildImageUrl(product.image, 260, 260);
  }, [product.image]);

  // Generate URL using slug (same format as ref/product-gallery.js)
  const productUrl = useMemo(() => {
    if (!product.slug) {
      console.warn('⚠️ Product has no slug:', product);
      return '#';
    }
    return `/product-page/${product.slug}`;
  }, [product.slug]);
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageClick = () => {
    console.log('ProductCard image clicked:', product.slug);
    if (!product.slug) {
      console.error('❌ Cannot navigate - product has no slug:', product);
      return;
    }
    if (onImageClick) {
      onImageClick(product);
    } else {
      console.log('No onImageClick handler provided');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent, action: 'image' | 'cart') => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (action === 'image') {
        handleImageClick();
      } else if (action === 'cart') {
        handleAddToCart(e as any);
      }
    }
  };
  
  return (
    <div className={styles.productCard}>
      <a 
        href={productUrl}
        className={styles.productImageContainer}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault(); // Prevent actual navigation to avoid Wix re-render
          handleImageClick(); // Use internal SPA navigation instead
        }}
        onKeyUp={(e) => handleKeyUp(e, 'image')}
        title={`${product.artist} - ${product.title}`}
      >
        {!imageLoaded && !imageError && (
          <div className={styles.imageSkeleton}></div>
        )}
        <img 
          className={`${styles.productImage} ${imageLoaded ? styles.imageLoaded : styles.imageLoading} ${imageError ? styles.imageError : ''}`}
          src={imageUrl} 
          alt={`${product.artist} - ${product.title}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {imageError && (
          <div className={styles.imagePlaceholder}>
            <span>תמונה לא זמינה</span>
          </div>
        )}
        {product.ribbon && (
          <div className={styles.ribbon}>
            <p>{product.ribbon}</p>
          </div>
        )}
      </a>
      <div className={styles.productInfo}>
        <div className={styles.namePanel}>
          <a>{`${product.artist} - ${product.title}`}</a>
        </div>
        <div className={styles.pricePanel}>
          <a className={styles.priceText}>₪{product.price?.toFixed(2) ?? '0.00'}</a>
          <div 
            className={`${styles.btn} ${styles.btnPrice}`}
            role="button"
            tabIndex={0}
            onClick={handleAddToCart}
            onKeyUp={(e) => handleKeyUp(e, 'cart')}
          >
            הוספה לסל
          </div>
        </div>
      </div>
    </div>
  );
}
