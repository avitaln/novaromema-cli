import React, { useState } from 'react';
import { useCart } from './CartContext';
import { CatalogAPI } from './api';
import styles from './element.module.css';

interface CartPageProps {
  onClose: () => void;
}

interface ShippingOption {
  id: string;
  label: string;
  cost: number;
}

const shippingOptions: ShippingOption[] = [
  { id: 'regular', label: 'משלוח רגיל', cost: 20.0 },
  { id: 'pickup1', label: 'איסוף עצמי - חנות ראשית', cost: 0 },
  { id: 'pickup2', label: 'איסוף עצמי - חנות סניף', cost: 0 },
];

export const CartPage: React.FC<CartPageProps> = ({ onClose }) => {
  const { cart, loading, error, updateQuantity, removeItem } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<string>('regular');

  if (loading) {
    return (
      <div className={styles.cartPageContainer}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>סל הקניות שלי</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>טוען את הסל...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cartPageContainer}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>סל הקניות שלי</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>שגיאה: {error}</p>
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

  if (!cart || !cart.lineItems || cart.lineItems.length === 0) {
    return (
      <div className={styles.cartPageContainer}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>סל הקניות שלי</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <div className={styles.emptyCartContainer}>
          <div className={styles.emptyCartIcon}>🛒</div>
          <h2 className={styles.emptyCartTitle}>הסל ריק</h2>
          <p className={styles.emptyCartMessage}>עדיין לא הוספת פריטים לסל</p>
          <button onClick={onClose} className={styles.continueShoppingButton}>
            המשך קניות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPageContainer}>
      <button onClick={onClose} className={styles.closeButtonTop}>
        ✕
      </button>

      <div className={styles.cartContent}>
        <div className={styles.cartItemsSection}>
          <h1 className={styles.cartTitle}>סל הקניות שלי</h1>
          <div className={styles.cartItems}>
          {cart.lineItems.map((item, index) => {
            console.group(`📦 Cart Item #${index + 1}: ${item.productName?.translated || item.productName?.original || 'Unknown'}`);
            console.log('Item JSON:');
            console.log(JSON.stringify(item, null, 2));
            console.groupEnd();
            
            // Build proper image URL using the same logic as ProductCard
            const imageUrl = item.image ? CatalogAPI.buildImageUrl(item.image, 120, 120) : null;
            
            return (
            <div key={item._id} className={styles.cartItem}>
              {imageUrl && (
                <div className={styles.cartItemImage}>
                  <img 
                    src={imageUrl} 
                    alt={item.productName.translated || item.productName.original}
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className={styles.cartItemInfo}>
                <h3 className={styles.cartItemName}>
                  {item.productName.translated || item.productName.original}
                </h3>
                
                <div className={styles.cartItemPriceInfo}>
                  {item.fullPrice && parseFloat(item.fullPrice.amount) > parseFloat(item.price.amount) ? (
                    <>
                      <div className={styles.priceRow}>
                        <span className={styles.originalPrice}>{item.fullPrice.formattedAmount}</span>
                        <span className={styles.finalPrice}>{item.price.formattedAmount}</span>
                      </div>
                      {item.priceDescription && (
                        <span className={styles.discountLabel}>
                          {item.priceDescription.translated || item.priceDescription.original}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={styles.finalPrice}>{item.price.formattedAmount}</span>
                  )}
                </div>
              </div>
              
              <div className={styles.cartItemPriceSection}>
                <span className={styles.finalPrice}>{item.price.formattedAmount}</span>
              </div>
              
              <button 
                onClick={() => removeItem(item._id)}
                className={styles.removeButton}
                title="הסר פריט"
              >
                <svg width="20" height="20" viewBox="0 0 23 23" fill="currentColor">
                  <path fillRule="evenodd" d="M13.5,3 C14.327,3 15,3.673 15,4.5 L15,4.5 L15,5 L19,5 L19,6 L18,6 L18,17.5 C18,18.879 16.878,20 15.5,20 L15.5,20 L7.5,20 C6.122,20 5,18.879 5,17.5 L5,17.5 L5,6 L4,6 L4,5 L8,5 L8,4.5 C8,3.673 8.673,3 9.5,3 L9.5,3 Z M17,6 L6,6 L6,17.5 C6,18.327 6.673,19 7.5,19 L7.5,19 L15.5,19 C16.327,19 17,18.327 17,17.5 L17,17.5 L17,6 Z M10,9 L10,16 L9,16 L9,9 L10,9 Z M14,9 L14,16 L13,16 L13,9 L14,9 Z M13.5,4 L9.5,4 C9.224,4 9,4.225 9,4.5 L9,4.5 L9,5 L14,5 L14,4.5 C14,4.225 13.776,4 13.5,4 L13.5,4 Z"></path>
                </svg>
              </button>
            </div>
            );
          })}
          </div>
        </div>

        <div className={styles.cartSummary}>
          <h2 className={styles.cartSummaryTitle}>סיכום ההזמנה</h2>
          <div className={styles.cartTotals}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>סכום ביניים</span>
              <span className={styles.totalValue}>
                {cart.subtotal.formattedAmount}
              </span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>משלוח</span>
              <span className={styles.totalValue}>
                {shippingOptions.find(opt => opt.id === selectedShipping)?.cost === 0 
                  ? 'חינם' 
                  : `₪${shippingOptions.find(opt => opt.id === selectedShipping)?.cost.toFixed(2)}`
                }
              </span>
            </div>
          </div>

          <select 
            className={styles.shippingSelect}
            value={selectedShipping}
            onChange={(e) => setSelectedShipping(e.target.value)}
          >
            {shippingOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label} - {option.cost === 0 ? 'חינם' : `₪${option.cost.toFixed(2)}`}
              </option>
            ))}
          </select>

          <div className={styles.finalTotalContainer}>
            <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
              <span className={styles.totalLabel}>סך הכל</span>
              <span className={styles.totalAmount}>
                ₪{(
                  parseFloat(cart.subtotal.amount) + 
                  (shippingOptions.find(opt => opt.id === selectedShipping)?.cost || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className={styles.taxMessage}>המס כלול במחיר</div>
          </div>

          <div className={styles.cartActions}>
            <button className={styles.checkoutButton}>מעבר לתשלום</button>
          </div>

          <div className={styles.secureCheckout}>
            <svg
              width="11"
              height="14"
              viewBox="0 0 11 14"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.lockIcon}
            >
              <g fill="currentColor" fillRule="evenodd">
                <path d="M0 12.79c0 .558.445 1.01.996 1.01h9.008A1 1 0 0 0 11 12.79V6.01c0-.558-.445-1.01-.996-1.01H.996A1 1 0 0 0 0 6.01v6.78Z"></path>
                <path
                  d="M9.5 5v-.924C9.5 2.086 7.696.5 5.5.5c-2.196 0-4 1.586-4 3.576V5h1v-.924c0-1.407 1.33-2.576 3-2.576s3 1.17 3 2.576V5h1Z"
                  fillRule="nonzero"
                ></path>
              </g>
            </svg>
            <span>הליך תשלום מאובטח</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
