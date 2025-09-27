import React from 'react';
import { useCart } from './CartContext';
import styles from './element.module.css';

interface CartPageProps {
  onClose: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onClose }) => {
  const { cart, loading, error, updateQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className={styles.cartPageContainer}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>הסל שלי</h1>
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
          <h1 className={styles.cartTitle}>הסל שלי</h1>
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
          <h1 className={styles.cartTitle}>הסל שלי</h1>
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
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>הסל שלי</h1>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.lineItems.map((item) => (
            <div key={item._id} className={styles.cartItem}>
              {item.image && (
                <div className={styles.cartItemImage}>
                  <img 
                    src={item.image} 
                    alt={item.productName.translated || item.productName.original}
                  />
                </div>
              )}
              
              <div className={styles.cartItemDetails}>
                <h3 className={styles.cartItemName}>
                  {item.productName.translated || item.productName.original}
                </h3>
                
                {item.descriptionLines && item.descriptionLines.length > 0 && (
                  <div className={styles.cartItemOptions}>
                    {item.descriptionLines.map((line, index) => (
                      <div key={index} className={styles.cartItemOption}>
                        <span className={styles.optionName}>
                          {line.name.translated || line.name.original}:
                        </span>
                        <span className={styles.optionValue}>
                          {line.colorInfo ? (
                            <span className={styles.colorOption}>
                              {line.colorInfo.code && (
                                <span 
                                  className={styles.colorSwatch}
                                  style={{ backgroundColor: line.colorInfo.code }}
                                ></span>
                              )}
                              {line.colorInfo.translated || line.colorInfo.original}
                            </span>
                          ) : (
                            line.plainText?.translated || line.plainText?.original
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.cartItemPrice}>
                  <span className={styles.unitPrice}>
                    {item.price.formattedAmount}
                  </span>
                </div>
              </div>

              <div className={styles.cartItemActions}>
                <div className={styles.quantityControls}>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className={styles.quantityButton}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                
                <div className={styles.lineItemPrice}>
                  {item.lineItemPrice.formattedAmount}
                </div>
                
                <button 
                  onClick={() => removeItem(item._id)}
                  className={styles.removeButton}
                  title="הסר פריט"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.cartPageTotal}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>סה״כ:</span>
              <span className={styles.totalAmount}>
                {cart.subtotal.formattedAmount}
              </span>
            </div>
          </div>
          
          <div className={styles.cartActions}>
            <button className={styles.checkoutButton}>
              המשך לתשלום
            </button>
            <button onClick={onClose} className={styles.continueShoppingButton}>
              המשך קניות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
