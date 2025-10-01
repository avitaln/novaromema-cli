# Cart Testing Guide

## 🚀 Quick Start - Get Cart Data in 3 Steps

1. **Deploy** to live site
2. **Open** browser console (F12) and add items to cart
3. **Run** this command:
   ```javascript
   __NOVA_CART_DEBUG__.copyCartData()
   ```
4. **Paste** the JSON data that's now in your clipboard!

That's it! The complete cart structure is copied and ready to share.

---

## Overview
This guide helps you test the cart functionality locally and collect information from the live site to fine-tune the cart display.

## What's Been Implemented

### 1. Component Rename
- `Cart` component renamed to `CartButton` for clarity
- Updated all imports and references

### 2. Cart Auto-Refresh System
- Cart automatically refreshes when items are added
- Uses custom `cartUpdated` event system
- CartButton updates immediately after adding items
- Both event-based and direct refresh methods for reliability

### 3. Global Cart State
- `CartContext` provides shared state between `CartButton` and `CartPage`
- Both components automatically update when cart changes

### 4. Enhanced Console Logging
All cart operations now log detailed information for debugging.

## Console Log Output Reference

### CartButton Logs
```
🛒 CartButton: {
  itemCount: number,
  formattedTotal: string,
  loading: boolean,
  hasItems: boolean,
  timestamp: ISO date string
}
```

### CartContext Logs
```
CartContext: Fetching cart data...
CartContext: Cart data received: {
  cartId: string,
  lineItemsCount: number,
  subtotal: { amount, formattedAmount },
  currency: string,
  fullData: entire cart object
}

CartContext: Updating quantity: { lineItemId, newQuantity }
Cart change detected, refreshing cart...
```

### CartPage Logs
```
🛒 CartPage Render
├── Cart State: {
│     loading: boolean,
│     error: string | null,
│     hasCart: boolean,
│     cartId: string,
│     currency: string,
│     lineItemsCount: number
│   }
├── Cart Totals: {
│     subtotalAmount: string,
│     subtotalFormatted: string
│   }
└── Found X line items in cart

📦 Cart Item #1: Product Name
├── Item ID: string
├── Product Name: { original, translated }
├── Quantity: number
├── Unit Price: { amount, formatted }
├── Line Item Price: { amount, formatted }
├── Image URL: string
├── Description Lines: [{ name, plainText, colorInfo }]
└── Raw Item Data: full item object

💰 Cart Summary - Subtotal: { amount, formattedAmount }
```

## Testing Steps

### Step 1: Test on Live Site
1. Deploy your changes to the live site
2. Open browser Developer Tools (F12)
3. Go to the Console tab
4. Add items to cart
5. Open the cart page
6. **EASIEST METHOD**: Run this in console:
   ```javascript
   __NOVA_CART_DEBUG__.copyCartData()
   ```
   Then paste the result (it's already in your clipboard!)
   
7. **ALTERNATIVE**: Copy the JSON strings printed in the console logs

### Step 2: Analyze the Output
Look for:
- **Cart structure**: How are line items structured?
- **Pricing format**: Are amounts and formatted prices correct?
- **Image URLs**: Are images loading properly?
- **Description lines**: How are product variants/options structured?
- **Any errors**: Check for missing properties or undefined values

### Step 3: Test Cart Updates
1. **Add items to cart** - The cart button should update immediately showing:
   - Updated item count
   - Updated total
   - Console log: "🔔 Dispatched cartUpdated event"
   - Console log: "🔄 Cart update event received, refreshing cart..."

2. **Change item quantities** using +/- buttons in cart page
3. **Remove items** using the trash button
4. Check console for:
   - "CartContext: Updating quantity" logs
   - "CartContext: Refreshing cart after update" logs
   - Cart button updates in real-time

### Step 4: Test Local Development

#### Using Real Cart Data from Live Site

We've saved a snapshot of real cart data from your live site in:
`src/site/widgets/custom-elements/components-wrapper/mock-cart-data.json`

This includes:
- 3 real products (National Health LP, Machinete Cassette, Pantera LP)
- Real pricing in ILS (₪)
- Actual image URLs
- All cart properties including `fixedQuantity: true`

**To use this for local testing:**

1. Update `CartContext.tsx` to use mock data during development:
   ```typescript
   // Add at top of CartContext.tsx
   import mockCartData from './mock-cart-data.json';
   
   // In refreshCart function, add for local testing:
   const USE_MOCK_DATA = process.env.NODE_ENV === 'development';
   if (USE_MOCK_DATA) {
     setCart(mockCartData as Cart);
     setLoading(false);
     return;
   }
   ```

2. **Test Locally**:
   ```bash
   npm run dev
   # or
   npm run build && npm run preview
   ```

**Important Note**: The mock data shows all items have `fixedQuantity: true`, which means:
- Users cannot change quantities in the cart
- Quantity controls (+/-) should be disabled or hidden
- This needs to be handled in the CartPage component

## Common Issues to Look For

### Display Issues
- [ ] Images not showing or wrong size
- [ ] Text overflow or truncation
- [ ] Hebrew text direction (RTL) problems
- [ ] Price formatting issues
- [ ] Quantity controls not aligned
- [ ] Cart total not visible or misaligned

### Data Issues
- [ ] Missing product names
- [ ] Incorrect quantities
- [ ] Wrong prices
- [ ] Description lines not showing
- [ ] Empty cart showing when items exist

### Functional Issues
- [ ] Cart button not updating after adding items
- [ ] Cart not updating after quantity change
- [ ] Remove button not working
- [ ] Cart button showing wrong count
- [ ] Total not recalculating
- [ ] "cartUpdated" event not firing (check console for 🔔 emoji)

## What to Send Back

After testing on live site, send:

1. **Cart JSON data** - Run `__NOVA_CART_DEBUG__.copyCartData()` in console and paste the result
2. **Screenshots** of cart display issues (showing what looks wrong)
3. **List of specific problems** observed (e.g., "prices not showing", "images too small")
4. **Any error messages** from the console

The JSON data will contain:
- Complete cart structure
- All line items with full details
- Pricing information
- Timestamps
- Current loading/error state

## Next Steps After Data Collection

Once we have the console output and cart data structure:
1. We'll verify the data structure matches our TypeScript interfaces
2. Adjust CSS if layout issues are found
3. Fix any data mapping issues (e.g., missing fields)
4. Update the CartPage component to handle edge cases
5. Improve the styling for better display

## CSS Classes Reference

Cart components use these CSS classes (from `element.module.css`):
- `cartPageContainer` - Main cart page wrapper
- `cartHeader` - Header with title and close button
- `cartContent` - Main content area
- `cartItems` - List of cart items
- `cartItem` - Individual cart item
- `cartItemImage` - Product image container
- `cartItemDetails` - Product info section
- `cartItemActions` - Quantity controls and remove button
- `cartSummary` - Summary section with total
- `quantityControls` - +/- buttons
- `cartPageTotal` - Total price display

If any of these classes are missing styles, we'll need to add them.

## Console Filtering Tips

In Chrome/Edge DevTools Console:
- Filter by `🛒` to see only cart-related logs
- Filter by `CartContext:` to see cart data operations
- Filter by `📦` to see individual item logs
- Filter by `💰` to see pricing logs

In Firefox DevTools:
- Use the search box at the top of the console
- Click on the filter icon to save common searches

## Quick Debugging Commands - IMPORTANT!

### Easy Way to Get All Cart Data (Recommended)

Open browser console on the live site and run these commands:

```javascript
// Option 1: Copy cart data directly to clipboard
__NOVA_CART_DEBUG__.copyCartData()
// This will copy the entire cart JSON to your clipboard - just paste it!

// Option 2: Display cart data in console as JSON
__NOVA_CART_DEBUG__.getCartData()
// This will print the cart data as JSON - you can then copy from console

// Option 3: Manually refresh cart (useful for testing)
__NOVA_CART_DEBUG__.refreshCart()
// Forces cart to refresh - you should see updated data
```

After running `copyCartData()`, you'll see "✅ Cart data copied to clipboard!" - then just paste (Ctrl+V / Cmd+V) into a text file or message to send it to me.

### Additional Debugging Commands

```javascript
// Check if cart button is visible
document.querySelector('[class*="cartContainer"]')

// Check cart page elements
document.querySelectorAll('[class*="cartItem"]').length

// Get cart items count
document.querySelectorAll('[class*="cartItem"]').length
```

## File Structure

```
src/site/widgets/custom-elements/components-wrapper/
├── Cart.tsx              (CartButton component)
├── CartPage.tsx          (Full cart page with items)
├── CartContext.tsx       (Global cart state)
└── element.module.css    (Styles)
```

