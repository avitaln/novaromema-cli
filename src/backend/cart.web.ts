import { Permissions, webMethod } from '@wix/web-methods';
import { currentCart, checkout } from '@wix/ecom';

export interface AddToCartRequest {
  catalogItemId: string;
  quantity?: number;
  options?: Record<string, any>;
}

export const getCheckoutUrl = webMethod(Permissions.Anyone, async () => {
  const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({ channelType: "WIX_APP_STORE" }); 
  const { checkoutUrl } = await checkout.getCheckoutUrl(checkoutId as string);
  return checkoutUrl;
});

export const addToCart = webMethod(Permissions.Anyone, async (request: AddToCartRequest) => {
  try {
    const { catalogItemId, quantity = 1, options = {} } = request;
    
    // Add item to current cart using Wix eCommerce API
    const updatedCart = await currentCart.addToCurrentCart({
      lineItems: [{
        catalogReference: {
          // Your app's GUID - you'll need to replace this with your actual app ID
          appId: "c3c66534-1ec3-4e2f-9768-e0309cbec8ca",
          catalogItemId: catalogItemId,
          options: options
        },
        quantity: quantity
      }]
    });

    console.log('Successfully added item to cart:', updatedCart);
    return {
      success: true,
      cart: updatedCart,
      message: 'Item added to cart successfully'
    };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to add item to cart'
    };
  }
});
