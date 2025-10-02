import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currentCart } from '@wix/ecom';
import { addToCart as addToCartBackend } from '../../../../backend/cart.web';
import { CenterMessage, CenterMessageDisplay } from './CenterMessage';

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

interface ShippingOption {
  code: string;
  title: string;
  cost: {
    price: {
      amount: string;
      formattedAmount: string;
    };
  };
  logistics?: {
    instructions?: string;
    pickupDetails?: {
      address?: {
        addressLine1?: string;
        city?: string;
      };
      pickupMethod?: string;
    };
  };
}

interface ShippingInfo {
  selectedCarrierServiceOption?: {
    code: string;
    title: string;
  };
  carrierServiceOptions?: Array<{
    carrierId: string;
    shippingOptions: ShippingOption[];
  }>;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: string;
  formattedTotal: string;
  addingProductId: string | null;
  message: CenterMessage | null;
  shippingInfo: ShippingInfo | null;
  refreshCart: () => Promise<void>;
  addToCart: (catalogItemId: string, quantity?: number, options?: Record<string, any>, productInfo?: { artist: string; title: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateQuantity: (lineItemId: string, newQuantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  updateShippingOption: (shippingOptionCode: string) => Promise<void>;
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
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<CenterMessage | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('CartContext: Fetching cart data...');
      const estimateData = await currentCart.estimateCurrentCartTotals();
      const cartData = estimateData.cart as Cart;
      const shippingData = estimateData.shippingInfo as ShippingInfo;
      console.log('CartContext: Cart data received (summary):', {
        cartId: cartData._id,
        lineItemsCount: cartData.lineItems?.length || 0,
        subtotal: cartData?.subtotal,
        currency: cartData?.currency,
        selectedShipping: shippingData?.selectedCarrierServiceOption?.title,
        availableOptions: shippingData?.carrierServiceOptions?.reduce((acc, carrier) => acc + carrier.shippingOptions.length, 0),
      });
      console.log('CartContext: Full estimate data JSON:');
      console.log(JSON.stringify(estimateData, null, 2));
      setCart(cartData);
      setShippingInfo(shippingData);
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

  const updateShippingOption = async (shippingOptionCode: string) => {
    const IS_TEST = import.meta.env.VITE_IS_TEST === 'true';
    
    if (IS_TEST) {
      console.log('🧪 CartContext: [TEST MODE] Updating shipping option (simulated):', { shippingOptionCode });
      // In test mode, just update local state
      setShippingInfo(prevInfo => {
        if (!prevInfo) return null;
        return {
          ...prevInfo,
          selectedCarrierServiceOption: {
            code: shippingOptionCode,
            title: prevInfo.carrierServiceOptions
              ?.flatMap(c => c.shippingOptions)
              .find(opt => opt.code === shippingOptionCode)?.title || ''
          }
        };
      });
      return;
    }

    try {
      console.log('CartContext: Updating shipping option:', { shippingOptionCode });
      
      // Update the cart with the new shipping option
      // The API returns the updated estimate with cart and shippingInfo
      const estimateData = await (currentCart.updateCurrentCart as any)({
        selectedShippingOption: {
          code: shippingOptionCode
        }
      });
      
      const cartData = (estimateData as any).cart as Cart;
      const shippingData = (estimateData as any).shippingInfo as ShippingInfo;
      
      console.log('CartContext: Cart updated with new shipping:', {
        selectedShipping: shippingData?.selectedCarrierServiceOption?.title,
        subtotal: cartData?.subtotal,
      });
      
      setCart(cartData);
      setShippingInfo(shippingData);
    } catch (err) {
      console.error('CartContext: Failed to update shipping option:', err);
      setError('Failed to update shipping option');
    }
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
    if (addingProductId) {
      console.log('CartContext: Already adding to cart, ignoring duplicate request');
      return { success: false, message: 'Already adding to cart' };
    }

    setAddingProductId(catalogItemId);
    setMessage(null); // Clear any previous messages

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
        const messageText = productInfo 
          ? `${productInfo.artist} - ${productInfo.title} נוסף לסל בהצלחה!`
          : 'המוצר נוסף לסל בהצלחה!';
        
        setMessage({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          message: messageText
        });
        
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
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          message: `שגיאה בהוספה לסל: ${result.message || 'שגיאה לא ידועה'}`
        });
        
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
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: 'שגיאה בהוספה לסל. אנא נסה שוב מאוחר יותר.'
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error adding item to cart'
      };
    } finally {
      setAddingProductId(null);
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
    addingProductId,
    message,
    shippingInfo,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    updateShippingOption,
    clearMessage,
  };

  return (
    <CartContext.Provider value={value}>
      <CenterMessageDisplay message={message} onRemove={clearMessage} />
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
