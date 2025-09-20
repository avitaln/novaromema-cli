import React from 'react';
import styles from './element.module.css';

interface CartProps {
  itemCount?: number;
  totalPrice?: number;
}

export const Cart: React.FC<CartProps> = ({ itemCount = 0, totalPrice = 0 }) => {
  const hasItems = itemCount > 0;

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartIconWrapper}>
        <svg 
          className={styles.cartIcon} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          style={{width: '1.75rem', height: '1.75rem'}}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v14H4V6z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/>
        </svg>
        {hasItems && (
          <a href="#" className={styles.cartNumber}>{itemCount}</a>
        )}
      </div>
      
      {hasItems ? (
        <div className={styles.cartTotal}>סה״כ: ₪{totalPrice}</div>
      ) : (
        <span className={styles.cartText}>הסל ריק</span>
      )}
    </div>
  );
};

export default Cart;
