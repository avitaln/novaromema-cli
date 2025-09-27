import React, { useState, useMemo } from 'react';
import { CatalogAPI, type PartialProduct } from './api';
import { createProductRoute } from './routes';
import { addToCart } from '../../../../backend/cart.web';
import { useToast } from './useToast';
import { CenterMessageDisplay } from './CenterMessage';
import styles from './element.module.css';

interface ProductCardProps {
  product: PartialProduct;
  onImageClick?: (product: PartialProduct) => void;
  onAddToCart?: (product: PartialProduct) => void;
}

export function ProductCard({ product, onImageClick, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { message, removeMessage, showSuccess, showError } = useToast();
  
  const imageUrl = useMemo(() => {
    return CatalogAPI.buildImageUrl(product.image, 260, 260);
  }, [product.image]);

  // Generate URL using slug (same format as ref/product-gallery.js)
  const productUrl = useMemo(() => {
    if (!product.slug) {
      console.warn('⚠️ Product has no slug:', product);
      return '#';
    }
    return createProductRoute(product.slug);
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAddingToCart) return; // Prevent double clicks
    
    setIsAddingToCart(true);
    
    try {
      const result = await addToCart({
        catalogItemId: product.id,
        quantity: 1
      });
      
      if (result.success) {
        console.log('Item added to cart successfully:', result.cart);
        showSuccess(`${product.artist} - ${product.title} נוסף לסל בהצלחה!`);
        // Call the optional callback if provided
        if (onAddToCart) {
          onAddToCart(product);
        }
      } else {
        console.error('Failed to add item to cart:', result.error);
        showError(`שגיאה בהוספה לסל: ${result.message || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      showError('שגיאה בהוספה לסל. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent, action: 'image' | 'cart') => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (action === 'image') {
        handleImageClick();
      } else if (action === 'cart' && !isAddingToCart) {
        handleAddToCart(e as any);
      }
    }
  };
  
  return (
    <>
      <CenterMessageDisplay message={message} onRemove={removeMessage} />
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
        title={`${product.artist} ${product.title}${product.shortFormat ? ` (${product.shortFormat})` : ''}`}
      >
        {!imageLoaded && !imageError && (
          <div className={styles.imageSkeleton}></div>
        )}
        <img 
          className={`${styles.productImage} ${imageLoaded ? styles.imageLoaded : styles.imageLoading} ${imageError ? styles.imageError : ''}`}
          src={imageUrl} 
          alt={`${product.artist} ${product.title}${product.shortFormat ? ` (${product.shortFormat})` : ''}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {imageError && (
          <div className={styles.imagePlaceholder}>
            <span>תמונה לא זמינה</span>
          </div>
        )}
        {(product.ribbon || product.isNew === false) && (
          <div className={styles.ribbon}>
            <p>{product.ribbon || '∙ יד שניה ∙'}</p>
          </div>
        )}
      </a>
      <div className={styles.productInfo}>
        <div className={styles.namePanel}>
          <a>
            <span className={styles.artistName}>{product.artist}</span> {product.title}{product.shortFormat ? ` (${product.shortFormat})` : ''}
          </a>
        </div>
        <div className={styles.pricePanel}>
          <a className={styles.priceText}>₪{product.price?.toFixed(2) ?? '0.00'}</a>
          <div 
            className={`${styles.btn} ${styles.btnPrice} ${isAddingToCart ? styles.btnDisabled : ''}`}
            role="button"
            tabIndex={isAddingToCart ? -1 : 0}
            onClick={handleAddToCart}
            onKeyUp={(e) => handleKeyUp(e, 'cart')}
            style={{ opacity: isAddingToCart ? 0.6 : 1, cursor: isAddingToCart ? 'not-allowed' : 'pointer' }}
          >
            {isAddingToCart ? 'מוסיף לסל...' : 'הוספה לסל'}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
