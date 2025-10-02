import React from 'react';
import { useCart } from './CartContext';
import styles from './element.module.css';

interface CartButtonProps {
  onClick?: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ onClick }) => {
  const { itemCount, formattedTotal, loading } = useCart();
  const hasItems = itemCount > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.cartContainer} onClick={handleClick}>
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
      
      {loading ? (
        <span className={styles.cartText}>טוען...</span>
      ) : hasItems ? (
        <div className={styles.cartTotal}>סה״כ: {formattedTotal}</div>
      ) : (
        <span className={styles.cartText}>הסל ריק</span>
      )}
    </div>
  );
};

export default CartButton;
