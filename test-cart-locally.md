# Testing Cart Locally with Mock Data

## Quick Start

Run the test server:
```bash
npm run testc
```

The test server will automatically:
1. Load mock cart data from `mock-cart-data.json`
2. Display the cart with 3 real products from your live site
3. Allow you to interact with the cart UI

## What's Included in Mock Data

The mock cart contains real data from your live site:

### Products:
1. **National Health - National Health (LP)** - ₪180.00
2. **Machinete - Cost To Cost (Cassette)** - ₪44.00
3. **Pantera - Cowboys From Hell (LP)** - ₪200.00

**Total: ₪424.00**

### Features:
- Real product names and images (120x120px thumbnails)
- Actual prices in ILS (₪)
- All cart properties including `fixedQuantity: true`
- Complete cart structure matching live site
- Proper Wix image URL handling (same as ProductCard)
- Centered layout with max-width (like ProductGallery)
- Detailed totals breakdown (subtotal, discounts, shipping, tax, final total)
- Two-column layout on desktop (items left, totals right with sticky positioning)
- Single-column layout on mobile (totals flow after items)

## Test Mode Indicators

When running in test mode (`npm run testc`), you'll see:

### Console Logs:
- `🧪 CartContext: Using MOCK cart data for testing`
- `🧪 [TEST MODE] Simulating add to cart`
- `🧪 [TEST MODE] Updating quantity (simulated)`

### Success Messages:
- `🧪 [TEST] נוסף לסל בהצלחה!` when adding items

## What You Can Test

### ✅ Works in Test Mode:
- **View cart** - See all 3 products with real data and images
- **Cart button** - Shows correct item count (3) and total (₪424.00)
- **Navigate to cart page** - View full cart with line items
- **Remove items** - Click trash icon to remove items (local state only)
- **Add to cart** - Simulates adding items with success messages

### ⚠️ Simulated (Not Real API Calls):
- Adding items doesn't create real cart items
- Removing items only updates local state (not persisted to Wix)

## Important Notes

### Fixed Quantity
All products in the mock data have `fixedQuantity: true`, which means:
- Users can't change quantities in the cart
- Each product can only be purchased once
- **Quantity controls have been removed** from the cart page

✅ The cart now displays only the price and remove button for each item, respecting the `fixedQuantity` constraint.

### Updating Mock Data

To test with different cart data:

1. **From Live Site**:
   - Open browser console on live site
   - Run: `__NOVA_CART_DEBUG__.copyCartData()`
   - Paste the output into `mock-cart-data.json`

2. **Manual Edit**:
   - Edit `src/site/widgets/custom-elements/components-wrapper/mock-cart-data.json`
   - Keep the same structure
   - Rebuild with `npm run build`

## Test Workflow

1. **Start test server**:
   ```bash
   npm run testc
   ```
   Opens browser at `http://localhost:3001`

2. **Navigate to cart**:
   - Click the cart button in the navbar
   - Should show "3 items - ₪424.00"

3. **Test cart page**:
   - View all 3 products with images and prices
   - Try removing items (click trash icon)
   - Check console logs for mock data confirmations
   - Verify no quantity controls are shown (respects `fixedQuantity: true`)

4. **Test from product pages**:
   - Browse products
   - Click "Add to Cart" buttons
   - Should see test mode success messages
   - Cart button should update (in test mode, adds to mock data)

## Switching Between Test and Production

### Test Mode (Local):
```bash
npm run testc  # Uses mock data
```
- `VITE_IS_TEST='true'`
- Loads `mock-cart-data.json`
- No real API calls
- All operations are simulated

### Development Mode (Wix Dev):
```bash
npm run dev  # Uses real Wix APIs
```
- `VITE_IS_TEST` is undefined
- Calls real Wix ecom APIs
- Actual cart operations

### Production:
```bash
npm run build && npm run release
```
- Uses real Wix APIs
- Full production environment

## Debugging

### View Mock Data in Console:
```javascript
// In browser console when running npm run testc:
__NOVA_CART_DEBUG__.getCartData()
```

### Check Test Mode:
```javascript
// Should return "true" in test mode
import.meta.env.VITE_IS_TEST
```

### Force Cart Refresh:
```javascript
__NOVA_CART_DEBUG__.refreshCart()
```

## Next Steps

1. ✅ **Fixed `fixedQuantity` handling** - Quantity controls removed from cart
2. ✅ **Fixed image display** - Using proper Wix image URLs (120x120px)
3. ✅ **Cart layout improved** - Centered content with margins, detailed totals section
4. **Test edge cases** - Empty cart, single item, many items
5. **Test RTL display** - Hebrew text and pricing

## File Locations

- Mock data: `src/site/widgets/custom-elements/components-wrapper/mock-cart-data.json`
- Cart context: `src/site/widgets/custom-elements/components-wrapper/CartContext.tsx`
- Test config: `vite.test.config.ts`
- Test entry: `test/main.ts`

