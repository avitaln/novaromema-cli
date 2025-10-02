# Check these in the browser console:

1. When you click "הוספה לסל", what is the `product.id` value?
   - Open console and look for: "CartContext: Adding item to cart:"
   - What catalogItemId is shown?

2. What is the exact error message?
   - Look for error logs after clicking add to cart
   - Is it a 500 error? 400? What does the error say?

3. Check if products exist in Wix catalog:
   - The product.id from your API (like "dc3791856215") needs to match a Wix Stores catalogItemId
   - Or do you need to map/sync products from novaromema API to Wix Stores first?

Example of what to look for in console:
- "CartContext: Adding item to cart: { catalogItemId: 'XXXXX', ... }"
- "CartContext: Failed to add item: ..."
- Any error response from the backend
