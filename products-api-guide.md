# Products API Usage Guide for JavaScript Developers

## Overview

The `/products` endpoint provides access to a music catalog with extensive filtering, sorting, and search capabilities. 

**🔑 Key Feature**: The API uses **POST requests with JSON body** for all queries. No more base64 encoding required!

This guide covers all available features for JavaScript developers.

## Base URL Structure

```javascript
const BASE_URL = "https://novaromema-public.fly.dev"; // Replace with your actual domain
const endpoint = `${BASE_URL}/products`;

// Helper function for POST requests
async function queryProducts(queryObject) {
  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryObject)
  });
  return await response.json();
}
```

## Response Structure

### Basic Response Format

```json
{
  "products": [
    {
      "id": "string",
      "artist": "string",
      "title": "string", 
      "image": "string",
      "price": number,
      // Additional fields in full response...
    }
  ],
  "total": number | null
}
```

### Partial vs Full Response

The API supports two response modes:

**Partial Response** (`partial=true`): Lightweight response with essential fields only:
- `id`, `artist`, `title`, `image`, `price`

**Full Response** (`partial=false` or omitted): Complete product data including:
- All partial fields plus: `posted`, `shortFormat`, `formats`, `specials`, `genres`, `label`, `country`, `released`, `isNew`, `isTagged`, `createdDate`, `metadata`

## Basic Usage Examples

### Simple Product Fetch

```javascript
async function getProducts() {
  try {
    const query = {
      limit: 10,
      filter: {}
    };
    const data = await queryProducts(query);
    console.log(`Found ${data.total} products total`);
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}
```

### With Query Parameters

```javascript
async function getProductsWithFilters() {
  const query = {
    limit: 20,
    offset: 0,
    sort: 'pricelow',
    returnTotal: true,
    filter: {
      artist: 'jimi',
      minPrice: 20,
      maxPrice: 100
    }
  };
  
  return await queryProducts(query);
}
```

## Request Body Structure

The API uses a **POST request with JSON body** that contains:

### ProductQuery Structure

The POST body follows this structure:

```javascript
{
  // Query-level parameters (optional)
  "limit": 20,           // Maximum results
  "offset": 0,           // Pagination offset
  "returnTotal": true,   // Include total count
  "partial": false,      // Response type
  "sort": "pricelow",    // Sorting option
  
  // Filter object (required, can be empty {})
  "filter": {
    // All filter criteria go here
    "artist": "pink floyd",
    "minPrice": 20,
    "maxPrice": 100,
    "formats": [1, 2],   // CD and LP
    "specials": [2]      // Recommended
  }
}
```

### Query-Level Parameters

These parameters can be specified at the top level of the POST body:

#### Pagination
- `limit` (number): Maximum number of results (default: 50)
- `offset` (number): Number of results to skip (default: 0)

#### Response Control  
- `partial` (boolean): Return lightweight response (`true`/`false`)
- `returnTotal` (boolean): Include total count in response (`true`/`false`)

#### Sorting
- `sort` (string): Sort order options:
  - `"pricelow"`: Price low to high
  - `"pricehigh"`: Price high to low
  - `"artist"`: Alphabetical by artist
  - `"title"`: Alphabetical by title
  - Default: Most recent first

### Filter Object Parameters

These parameters go inside the `filter` object:

#### Search & Filtering
- `artist` (string): Filter by artist name (case-insensitive, partial match)
- `title` (string): Filter by song/album title (case-insensitive, partial match) 
- `name` (string): Search both artist AND title fields
- `id` (string): Get specific product by ID
- `country` (string): Filter by country of origin
- `slug` (string): Filter by product slug

#### Price Filtering
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

#### Product Attributes
- `isNew` (boolean): Filter by new vs used condition (`true`/`false`)

#### Category Filtering
- `specials` (array of numbers): Filter by special categories
- `genres` (array of numbers): Filter by music genres  
- `formats` (array of numbers): Filter by physical formats

## Advanced Usage

### POST Request Examples

Here are practical examples using the new POST structure:

#### Multi-Category Filter
```javascript
async function getProductsWithComplexFilter() {
  const query = {
    limit: 20,
    offset: 0,
    sort: "pricelow",
    filter: {
      minPrice: 20,
      maxPrice: 100,
      specials: [1, 2], // Preorder and Recommended
      formats: [1, 2],  // CD and LP
      genres: [5, 8]    // Specific genre IDs
    }
  };
  
  return await queryProducts(query);
}
```

#### Search with Complex Criteria
```javascript
async function searchRecommendedVinylUnder50() {
  const query = {
    limit: 25,
    partial: true,          // Lightweight response
    sort: "pricelow",
    filter: {
      name: "jazz",         // Search both artist and title
      formats: [2],         // LP only
      specials: [2],        // Recommended only
      maxPrice: 50,
      isNew: false          // Used records only
    }
  };
  
  return await queryProducts(query);
}
```

### Parameter Override Behavior

**Important**: Query-level parameters override filter values for these fields:
- `limit`, `offset`, `returnTotal`, `partial`, `sort`

```javascript
// Query-level limit overrides filter limit
const query = {
  limit: 20,              // This takes precedence
  filter: {
    limit: 10,            // This is ignored
    artist: "beatles"
  }
};

// Final limit will be 20, not 10
const result = await queryProducts(query);
```

### Category Constants Reference

Based on the API code, here are the category constants:

#### Special Categories (`specials`)
- `1`: Preorder
- `2`: Recommended  
- `3`: Classics
- `4`: New in Stock
- `5`: Rare

#### Format Categories (`formats`)
- `1`: CD
- `2`: LP (Vinyl Album)
- `3`: 10" Record
- `4`: 12" Record  
- `5`: 7" Single
- `6`: Cassette

### Example: Filter by Format and Special Category

```javascript
async function getRecommendedVinyl() {
  const query = {
    limit: 20,
    sort: 'pricelow',
    filter: {
      formats: [2],      // LP format
      specials: [2]      // Recommended category
    }
  };
  
  return await queryProducts(query);
}
```

### Example: Search with Price Range

```javascript
async function searchWithPriceRange(searchTerm, minPrice, maxPrice) {
  const query = {
    limit: 50,
    sort: 'pricelow',
    partial: false,     // Get full product details
    filter: {
      name: searchTerm, // Searches both artist and title
      minPrice: minPrice,
      maxPrice: maxPrice
    }
  };
  
  return await queryProducts(query);
}

// Usage
const results = await searchWithPriceRange('pink floyd', 20, 80);
```

## Pagination Helper

```javascript
class ProductsPaginator {
  constructor(baseUrl, pageSize = 20) {
    this.baseUrl = baseUrl;
    this.pageSize = pageSize;
  }
  
  async getPage(pageNumber, filters = {}) {
    const offset = pageNumber * this.pageSize;
    const query = {
      limit: this.pageSize,
      offset: offset,
      returnTotal: true,
      filter: filters
    };
    
    const data = await queryProducts(query);
    
    return {
      products: data.products,
      total: data.total,
      currentPage: pageNumber,
      totalPages: Math.ceil(data.total / this.pageSize),
      hasNext: (pageNumber + 1) * this.pageSize < data.total,
      hasPrev: pageNumber > 0
    };
  }
}

// Usage
const paginator = new ProductsPaginator(BASE_URL, 25);
const page1 = await paginator.getPage(0, { artist: 'beatles' });
```

## Error Handling

```javascript
async function safeProductFetch(query = { filter: {} }) {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle empty results
    if (data.products.length === 0) {
      console.log('No products found matching criteria');
      return { products: [], total: 0 };
    }
    
    return data;
    
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Return safe empty result
    return { 
      products: [], 
      total: 0,
      error: error.message 
    };
  }
}
```

## Complete Example: Product Search Component

```javascript
class ProductSearch {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }
  
  async search({
    query = '',
    priceMin = null,
    priceMax = null, 
    formats = null,
    specials = null,
    genres = null,
    isNew = null,
    country = null,
    sortBy = 'title',
    page = 0,
    pageSize = 20,
    partial = false
  } = {}) {
    
    // Build filter object
    const filter = {};
    
    // Add search criteria to filter
    if (query) filter.name = query;
    if (priceMin !== null) filter.minPrice = priceMin;
    if (priceMax !== null) filter.maxPrice = priceMax;
    if (formats !== null) filter.formats = Array.isArray(formats) ? formats : [formats];
    if (specials !== null) filter.specials = Array.isArray(specials) ? specials : [specials];
    if (genres !== null) filter.genres = Array.isArray(genres) ? genres : [genres];
    if (isNew !== null) filter.isNew = isNew;
    if (country !== null) filter.country = country;
    
    // Build query object
    const queryObj = {
      limit: pageSize,
      offset: page * pageSize,
      sort: sortBy,
      partial: partial,
      returnTotal: true,
      filter: filter
    };
    
    try {
      const response = await fetch(`${this.apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryObj)
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        products: data.products,
        total: data.total,
        page,
        pageSize,
        totalPages: Math.ceil(data.total / pageSize)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        products: [],
        total: 0
      };
    }
  }
}

// Usage example
const productSearch = new ProductSearch(BASE_URL);

// Search for recommended jazz vinyl under $50
const results = await productSearch.search({
  query: 'jazz',
  formats: [2],        // LP format (as array)
  specials: [2],       // Recommended category
  priceMax: 50,
  sortBy: 'pricelow',
  page: 0,
  pageSize: 20,
  partial: true        // Lightweight response for lists
});

if (results.success) {
  console.log(`Found ${results.total} recommended jazz LPs under $50`);
  results.products.forEach(product => {
    console.log(`${product.artist} - ${product.title}: $${product.price}`);
  });
}
```

## Performance Tips

1. **Use partial responses** when you only need basic product info (for lists, search results)
2. **Set appropriate limits** to avoid large responses
3. **Cache total counts** when possible rather than requesting on every call
4. **Reuse filter objects** for complex, repeated queries
5. **Implement debouncing** for search-as-you-type functionality

```javascript
// Debounced search example
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSearch = debounce(async (query) => {
  const results = await productSearch.search({ query, partial: true });
  // Update UI with results
}, 300);
```

## CORS and Authentication

The API supports CORS for the following origins:
- `https://www.novaromema.com`
- `https://www.mashrabiya-artpic.shop`
- `https://novaromemasync.fly.dev`  
- `https://novaromema-public.fly.dev`
- `http://localhost:8080`, `http://localhost:3001-3003`

Make sure your requests include proper headers if authentication is required.

---

This guide covers all major functionality of the `/products` endpoint. For additional questions or advanced use cases, refer to the integration tests in the codebase or contact the API maintainers.
