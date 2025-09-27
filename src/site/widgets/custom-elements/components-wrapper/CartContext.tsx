import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currentCart } from '@wix/ecom';

interface CartItem {
  _id: string;
  productName: {
    original: string;
    translated?: string;
  };
  image?: string;
  price: {
    amount: string;
    formattedAmount: string;
  };
  quantity: number;
  lineItemPrice: {
    amount: string;
    formattedAmount: string;
  };
  descriptionLines?: Array<{
    name: {
      original: string;
      translated?: string;
    };
    plainText?: {
      original: string;
      translated?: string;
    };
    colorInfo?: {
      original: string;
      translated?: string;
      code?: string;
    };
  }>;
}

interface Cart {
  _id: string;
  lineItems: CartItem[];
  subtotal: {
    amount: string;
    formattedAmount: string;
  };
  currency: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: string;
  formattedTotal: string;
  refreshCart: () => Promise<void>;
  updateQuantity: (lineItemId: string, newQuantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentCartData = await currentCart.getCurrentCart();
      setCart(currentCartData as Cart);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (lineItemId: string, newQuantity: number) => {
    if (!cart) return;

    try {
      if (newQuantity === 0) {
        // Remove item from cart
        await currentCart.removeLineItemsFromCurrentCart([lineItemId]);
      } else {
        // Update quantity
        await currentCart.updateCurrentCartLineItemQuantity([
          { _id: lineItemId, quantity: newQuantity }
        ]);
      }
      
      // Refresh cart data
      await refreshCart();
    } catch (err) {
      console.error('Failed to update cart:', err);
      setError('Failed to update cart');
    }
  };

  const removeItem = async (lineItemId: string) => {
    await updateQuantity(lineItemId, 0);
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Calculate derived values
  const itemCount = cart?.lineItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const totalAmount = cart?.subtotal?.amount || '0';
  const formattedTotal = cart?.subtotal?.formattedAmount || '₪0';

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    totalAmount,
    formattedTotal,
    refreshCart,
    updateQuantity,
    removeItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
