# Cart API Reference

## CartContext Hook

Import and use the cart context in any component:

```typescript
import { useCart } from './CartContext';
```

## Available Functions

### `addToCart(catalogItemId, quantity?, options?, productInfo?)`

Add an item to the cart with automatic loading state, messages, and cart refresh.

**Parameters:**
- `catalogItemId` (string, required): The product ID to add
- `quantity` (number, optional): Quantity to add (default: 1)
- `options` (Record<string, any>, optional): Additional options (e.g., variants)
- `productInfo` (object, optional): Product details for success message
  - `artist` (string): Artist name
  - `title` (string): Product title

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
  message?: string;
}>
```

**Example:**
```typescript
function ProductCard({ product }) {
  const { addToCart, isAddingToCart, message } = useCart();
  
  const handleAddToCart = () => {
    // That's it! Everything else is handled by CartContext
    addToCart(
      product.id, 
      1, 
      {}, 
      { artist: product.artist, title: product.title }
    );
  };
  
  return (
    <>
      {/* Message is automatically managed by CartContext */}
      {message && <div>{message.text}</div>}
      
      <button 
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </button>
    </>
  );
}
```

**What happens automatically:**
1. Sets `isAddingToCart` to true (prevents double-clicks)
2. Calls backend addToCart web method
3. On success:
   - Sets success message with product info
   - Dispatches `cartUpdated` event
   - Refreshes cart data
   - Auto-clears message after 3 seconds
4. On error:
   - Sets error message
   - Auto-clears message after 5 seconds
5. Sets `isAddingToCart` to false

---

### `updateQuantity(lineItemId, newQuantity)`

Update the quantity of an item in the cart.

**Parameters:**
- `lineItemId` (string, required): The line item ID from cart.lineItems
- `newQuantity` (number, required): New quantity (0 will remove the item)

**Returns:** `Promise<void>`

**Example:**
```typescript
function CartItem({ item }) {
  const { updateQuantity } = useCart();
  
  const handleIncrease = () => {
    updateQuantity(item._id, item.quantity + 1);
  };
  
  const handleDecrease = () => {
    updateQuantity(item._id, item.quantity - 1);
  };
  
  return (
    <>
      <button onClick={handleDecrease}>-</button>
      <span>{item.quantity}</span>
      <button onClick={handleIncrease}>+</button>
    </>
  );
}
```

---

### `removeItem(lineItemId)`

Remove an item from the cart.

**Parameters:**
- `lineItemId` (string, required): The line item ID to remove

**Returns:** `Promise<void>`

**Example:**
```typescript
function CartItem({ item }) {
  const { removeItem } = useCart();
  
  return (
    <button onClick={() => removeItem(item._id)}>
      Remove
    </button>
  );
}
```

---

### `refreshCart()`

Manually refresh the cart data from the server.

**Parameters:** None

**Returns:** `Promise<void>`

**Example:**
```typescript
function CartPage() {
  const { cart, refreshCart } = useCart();
  
  useEffect(() => {
    // Refresh cart when page opens
    refreshCart();
  }, []);
  
  return <div>Cart items: {cart?.lineItems?.length || 0}</div>;
}
```

---

## Available Properties

### `cart`
The current cart object with all line items and totals.

**Type:**
```typescript
{
  _id: string;
  lineItems: CartItem[];
  subtotal: {
    amount: string;
    formattedAmount: string;
  };
  currency: string;
} | null
```

### `loading`
Whether the cart is currently loading.

**Type:** `boolean`

### `error`
Any error message from cart operations.

**Type:** `string | null`

### `itemCount`
Total number of items in the cart (sum of all quantities).

**Type:** `number`

### `totalAmount`
Total price as a string number.

**Type:** `string`

### `formattedTotal`
Total price formatted for display (e.g., "₪150").

**Type:** `string`

### `isAddingToCart`
Whether an item is currently being added to the cart (prevents double-clicks).

**Type:** `boolean`

### `message`
Current success or error message to display to the user.

**Type:**
```typescript
{
  type: 'success' | 'error' | null;
  text: string;
  productInfo?: {
    artist: string;
    title: string;
  };
} | null
```

---

## `clearMessage()`

Manually clear the current message (messages auto-clear after 3-5 seconds).

**Parameters:** None

**Returns:** `void`

**Example:**
```typescript
const { message, clearMessage } = useCart();

return message && (
  <div onClick={clearMessage}>
    {message.text} (click to dismiss)
  </div>
);
```

---

## Complete Example

```typescript
import React from 'react';
import { useCart } from './CartContext';

function MyComponent() {
  const { 
    cart, 
    loading, 
    error,
    itemCount,
    formattedTotal,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart
  } = useCart();
  
  const handleAdd = async (productId: string) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Added to cart!');
    }
  };
  
  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Cart ({itemCount} items)</h2>
      <p>Total: {formattedTotal}</p>
      
      {cart?.lineItems.map(item => (
        <div key={item._id}>
          <span>{item.productName.translated || item.productName.original}</span>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
          <button onClick={() => removeItem(item._id)}>Remove</button>
        </div>
      ))}
      
      <button onClick={refreshCart}>Refresh Cart</button>
    </div>
  );
}
```

---

## Notes

- All cart operations automatically refresh the cart data
- The `cartUpdated` event is dispatched after successful operations
- All components using `useCart()` receive updates automatically
- Cart state is shared across all components in the app

