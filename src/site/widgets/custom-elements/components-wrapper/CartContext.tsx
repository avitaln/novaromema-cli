import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currentCart } from '@wix/ecom';
import { addToCart as addToCartBackend } from '../../../../backend/cart.web';
import mockCartData from './mock-cart-data.json';

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
  fullPrice?: {
    amount: string;
    formattedAmount: string;
  };
  priceDescription?: {
    original: string;
    translated?: string;
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
  subtotalAfterDiscounts?: {
    amount: string;
    formattedAmount: string;
  };
  discount?: {
    amount: string;
    formattedAmount: string;
  };
  currency: string;
  taxIncludedInPrices?: boolean;
}

interface CartMessage {
  type: 'success' | 'error' | null;
  text: string;
  productInfo?: {
    artist: string;
    title: string;
  };
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: string;
  formattedTotal: string;
  isAddingToCart: boolean;
  message: CartMessage | null;
  refreshCart: () => Promise<void>;
  addToCart: (catalogItemId: string, quantity?: number, options?: Record<string, any>, productInfo?: { artist: string; title: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateQuantity: (lineItemId: string, newQuantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearMessage: () => void;
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState<CartMessage | null>(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use mock data in test environment
      const IS_TEST = import.meta.env.VITE_IS_TEST === 'true';
      
      if (IS_TEST) {
        console.log('🧪 CartContext: Using MOCK cart data for testing');
        const cartData = mockCartData as Cart;
        console.log('CartContext: Mock cart data loaded (summary):', {
          cartId: cartData._id,
          lineItemsCount: cartData.lineItems?.length || 0,
          subtotal: cartData?.subtotal,
          currency: cartData?.currency,
        });
        console.log('CartContext: Full mock cart data JSON:');
        console.log(JSON.stringify(cartData, null, 2));
        setCart(cartData);
        setLoading(false);
        return;
      }
      
      console.log('CartContext: Fetching cart data...');
      const currentCartData = await currentCart.getCurrentCart();
      const cartData = currentCartData as Cart;
      console.log('CartContext: Cart data received (summary):', {
        cartId: cartData._id,
        lineItemsCount: cartData.lineItems?.length || 0,
        subtotal: cartData?.subtotal,
        currency: cartData?.currency,
      });
      console.log('CartContext: Full cart data JSON:');
      console.log(JSON.stringify(cartData, null, 2));
      setCart(cartData);
    } catch (err) {
      console.error('CartContext: Failed to fetch cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (lineItemId: string, newQuantity: number) => {
    if (!cart) return;

    const IS_TEST = import.meta.env.VITE_IS_TEST === 'true';
    
    if (IS_TEST) {
      console.log('🧪 CartContext: [TEST MODE] Updating quantity (simulated):', { lineItemId, newQuantity });
      // In test mode, update the mock cart locally
      if (newQuantity === 0) {
        console.log('🧪 [TEST MODE] Would remove item from cart');
        // Update local state by removing the item
        setCart(prevCart => {
          if (!prevCart) return null;
          return {
            ...prevCart,
            lineItems: prevCart.lineItems.filter(item => item._id !== lineItemId)
          };
        });
      } else {
        console.log('🧪 [TEST MODE] Would update item quantity');
        // Update local state by changing quantity
        setCart(prevCart => {
          if (!prevCart) return null;
          return {
            ...prevCart,
            lineItems: prevCart.lineItems.map(item => 
              item._id === lineItemId ? { ...item, quantity: newQuantity } : item
            )
          };
        });
      }
      return;
    }

    try {
      console.log('CartContext: Updating quantity:', { lineItemId, newQuantity });
      if (newQuantity === 0) {
        // Remove item from cart
        console.log('CartContext: Removing item from cart');
        await currentCart.removeLineItemsFromCurrentCart([lineItemId]);
      } else {
        // Update quantity
        console.log('CartContext: Updating item quantity');
        await currentCart.updateCurrentCartLineItemQuantity([
          { _id: lineItemId, quantity: newQuantity }
        ]);
      }
      
      // Refresh cart data
      console.log('CartContext: Refreshing cart after update');
      await refreshCart();
    } catch (err) {
      console.error('CartContext: Failed to update cart:', err);
      setError('Failed to update cart');
    }
  };

  const removeItem = async (lineItemId: string) => {
    await updateQuantity(lineItemId, 0);
  };

  // Clear message
  const clearMessage = () => {
    setMessage(null);
  };

  // Centralized add to cart function with loading state and messages
  const addToCart = async (
    catalogItemId: string, 
    quantity: number = 1, 
    options: Record<string, any> = {},
    productInfo?: { artist: string; title: string }
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    // Prevent double-clicks
    if (isAddingToCart) {
      console.log('CartContext: Already adding to cart, ignoring duplicate request');
      return { success: false, message: 'Already adding to cart' };
    }

    setIsAddingToCart(true);
    setMessage(null); // Clear any previous messages

    const IS_TEST = import.meta.env.VITE_IS_TEST === 'true';
    
    if (IS_TEST) {
      console.log('🧪 CartContext: [TEST MODE] Simulating add to cart:', { catalogItemId, quantity, options });
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🧪 [TEST MODE] Item would be added to cart');
      
      // Set success message
      if (productInfo) {
        setMessage({
          type: 'success',
          text: '🧪 [TEST] נוסף לסל בהצלחה!',
          productInfo
        });
      } else {
        setMessage({
          type: 'success',
          text: '🧪 [TEST] המוצר נוסף לסל בהצלחה!'
        });
      }
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
      setIsAddingToCart(false);
      return { success: true, message: 'Item added to cart (test mode)' };
    }

    try {
      console.log('CartContext: Adding item to cart:', { catalogItemId, quantity, options });
      
      const result = await addToCartBackend({
        catalogItemId,
        quantity,
        options
      });

      if (result.success) {
        console.log('CartContext: Item added successfully');
        
        // Set success message
        if (productInfo) {
          setMessage({
            type: 'success',
            text: 'נוסף לסל בהצלחה!',
            productInfo
          });
        } else {
          setMessage({
            type: 'success',
            text: 'המוצר נוסף לסל בהצלחה!'
          });
        }
        
        // Auto-clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
        
        // Trigger cart refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log('🔔 CartContext: Dispatched cartUpdated event');
        
        // Also directly refresh
        await refreshCart();
        
        return { success: true, message: result.message };
      } else {
        console.error('CartContext: Failed to add item:', result.error);
        
        // Set error message
        setMessage({
          type: 'error',
          text: `שגיאה בהוספה לסל: ${result.message || 'שגיאה לא ידועה'}`
        });
        
        // Auto-clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
        
        return { 
          success: false, 
          error: result.error, 
          message: result.message || 'Failed to add item to cart' 
        };
      }
    } catch (error) {
      console.error('CartContext: Error adding item to cart:', error);
      
      // Set error message
      setMessage({
        type: 'error',
        text: 'שגיאה בהוספה לסל. אנא נסה שוב מאוחר יותר.'
      });
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error adding item to cart'
      };
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Listen to custom cart update events
  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      console.log('🔄 Cart update event received, refreshing cart...');
      refreshCart();
    };

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    console.log('✅ Cart update listener registered');

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Expose cart data and refresh function to window for easy debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__NOVA_CART_DEBUG__ = {
        getCartData: () => {
          const data = {
            cart,
            loading,
            error,
            itemCount: cart?.lineItems?.reduce((total, item) => total + item.quantity, 0) || 0,
            timestamp: new Date().toISOString()
          };
          console.log('=== CART DATA JSON (Copy this) ===');
          console.log(JSON.stringify(data, null, 2));
          console.log('=== END CART DATA ===');
          return data;
        },
        copyCartData: () => {
          const data = {
            cart,
            loading,
            error,
            itemCount: cart?.lineItems?.reduce((total, item) => total + item.quantity, 0) || 0,
            timestamp: new Date().toISOString()
          };
          const jsonStr = JSON.stringify(data, null, 2);
          navigator.clipboard.writeText(jsonStr).then(() => {
            console.log('✅ Cart data copied to clipboard!');
          }).catch((err) => {
            console.error('Failed to copy to clipboard:', err);
            console.log('Please manually copy the JSON below:');
            console.log(jsonStr);
          });
          return jsonStr;
        },
        refreshCart: refreshCart
      };
    }
  }, [cart, loading, error, refreshCart]);

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
    isAddingToCart,
    message,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearMessage,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
