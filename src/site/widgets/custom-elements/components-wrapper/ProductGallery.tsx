import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { CatalogAPI, type PartialProduct, type ProductFilter } from './api';
import { ProductCard } from './ProductCard';
import { ProductPage } from './ProductPage';
import styles from './element.module.css';

// Clear all existing caches on component load

interface FilterOptions {
  search: string;
  genres: string[];
  labels: string[];
  formats: string[];
  years: string[];
  priceRange: string;
  sort: string;
}

// English genre labels mapped to API IDs (in correct order)
const GENRE_MAPPINGS: Record<string, number> = {
  'Israeli': 1,
  'Rock/Pop': 2,
  'Alternative Rock': 3,
  'New Wave/Post Punk/Gothic': 4,
  'Jazz/Blues': 5,
  'Soul/Funk': 6,
  'Electronic': 7,
  'Trance': 8,
  'Experimental/Industrial/Noise': 9,
  'Hip Hop': 10,
  'Reggae/Dub': 11,
  'Hardcore/Punk': 12,
  'Metal': 13,
  'Doom/Sludge/Stoner': 14,
  'Prog/Psychedelic': 15,
  'Folk/Country': 16,
  'World': 17,
  'Classical': 18,
  'Soundtracks': 19
};

const LABEL_MAPPINGS: Record<string, string> = {
  'אד נוחים': 'ad nohim',
  'EMI': 'EMI',
  'Sony': 'Sony',
  'Warner': 'Warner',
  'Universal': 'Universal',
  'Indie': 'Indie'
};

const SORT_MAPPINGS: Record<string, string> = {
  'מחיר נמוך לגבוה': 'pricelow',
  'מחיר גבוה לנמוך': 'pricehigh',
  'לפי אמן': 'artist',
  'לפי כותרת': 'title',
  'הכי חדש': ''
};

interface ProductGalleryProps {
  className?: string;
}

export function ProductGallery({ className }: ProductGalleryProps) {
  console.log('🖼️ ProductGallery component initialized');
  
  const [products, setProducts] = useState<PartialProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [stopLoading, setStopLoading] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | undefined>(undefined);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    genres: [],
    labels: [],
    formats: [],
    years: [],
    priceRange: '',
    sort: ''
  });
  
  // Get current path for route-based logic
  const currentPath = window.location.pathname;
  const PRODUCTS_PER_PAGE = 100;
  const MAX_INFINITE_SCROLL_PRODUCTS = 500;

  // Parse price range from Hebrew text to min/max values
  const parsePriceRange = (priceRange: string): { minPrice?: number; maxPrice?: number } => {
    switch (priceRange) {
      case 'עד 50 ש"ח':
        return { maxPrice: 50 };
      case '50-100 ש"ח':
        return { minPrice: 50, maxPrice: 100 };
      case '100-150 ש"ח':
        return { minPrice: 100, maxPrice: 150 };
      case '150+ ש"ח':
        return { minPrice: 150 };
      default:
        return {};
    }
  };

  // Filter Header Component
  const FilterHeader = () => {
    // Genre options in correct order with English labels
    const genres = [
      'Israeli',
      'Rock/Pop', 
      'Alternative Rock',
      'New Wave/Post Punk/Gothic',
      'Jazz/Blues',
      'Soul/Funk',
      'Electronic',
      'Trance',
      'Experimental/Industrial/Noise',
      'Hip Hop',
      'Reggae/Dub',
      'Hardcore/Punk',
      'Metal',
      'Doom/Sludge/Stoner',
      'Prog/Psychedelic',
      'Folk/Country',
      'World',
      'Classical',
      'Soundtracks'
    ];
    const labels = ['אד נוחים', 'EMI', 'Sony', 'Warner', 'Universal', 'Indie'];
    const formatOptions = ['LP', 'CD', 'Cassette', 'Digital'];
    const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];
    const priceRanges = ['עד 50 ש"ח', '50-100 ש"ח', '100-150 ש"ח', '150+ ש"ח'];
    const sortOptions = ['הכי חדש', 'מחיר נמוך לגבוה', 'מחיר גבוה לנמוך', 'לפי אמן', 'לפי כותרת'];

    return (
      <div className={styles.filterHeader}>
        <div className={styles.filterContainer}>
          {/* Search */}
          <div className={styles.filterItem}>
            <input
              type="text"
              placeholder="חיפוש במוצרים..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={styles.searchInput}
            />
          </div>

          {/* Genres Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.genres.includes(value)) {
                  setFilters(prev => ({ ...prev, genres: [...prev.genres, value] }));
                }
              }}
            >
              <option value="">Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Labels Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.labels.includes(value)) {
                  setFilters(prev => ({ ...prev, labels: [...prev.labels, value] }));
                }
              }}
            >
              <option value="">חברות הקלטות</option>
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {/* Formats Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.formats.includes(value)) {
                  setFilters(prev => ({ ...prev, formats: [...prev.formats, value] }));
                }
              }}
            >
              <option value="">סוג</option>
              {formatOptions.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          {/* Years Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !filters.years.includes(value)) {
                  setFilters(prev => ({ ...prev, years: [...prev.years, value] }));
                }
              }}
            >
              <option value="">שנים</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            >
              <option value="">טווח מחירים</option>
              {priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className={styles.filterItem}>
            <select 
              className={styles.filterSelect}
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="">מיון</option>
              {sortOptions.map(sort => (
                <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className={styles.resultsCount}>
            מציג {total} {currentPath === '/vinyl' ? 'תקליטים' : currentPath === '/cd' ? 'דיסקים' : 'תקליטים ודיסקים'}
          </div>
        </div>
        
        {/* Active Filters */}
        <div className={styles.activeFilters}>
          {filters.genres.map(genre => (
            <span key={genre} className={styles.filterTag}>
              {genre}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  genres: prev.genres.filter(g => g !== genre) 
                }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.labels.map(label => (
            <span key={label} className={styles.filterTag}>
              {label}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  labels: prev.labels.filter(l => l !== label) 
                }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.formats.map(format => (
            <span key={format} className={styles.filterTag}>
              {format}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  formats: prev.formats.filter(f => f !== format) 
                }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.years.map(year => (
            <span key={year} className={styles.filterTag}>
              {year}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  years: prev.years.filter(y => y !== year) 
                }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          ))}
          {filters.priceRange && (
            <span className={styles.filterTag}>
              {filters.priceRange}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, priceRange: '' }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          )}
          {filters.sort && (
            <span className={styles.filterTag}>
              מיון: {filters.sort}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, sort: '' }))}
                className={styles.removeFilter}
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleImageClick = (product: PartialProduct) => {
    console.log('Product clicked:', product.id);
    
    // Save scroll position like reference implementation (this.sp = window.scrollY)
    setScrollPosition(window.scrollY);
    
    // Find product index and set as selected (like reference's idSelected)
    const productIndex = products.findIndex(p => p.id === product.id);
    console.log('Setting selectedItemIndex to:', productIndex);
    setSelectedItemIndex(productIndex);
    
    // Update URL for browser history (like reference)
    window.history.pushState({ productPage: product.slug || product.id }, '', `/product-page/${product.slug || product.id}`);
  };

  const handleAddToCart = (product: PartialProduct) => {
    // Dispatch custom event for add to cart
    const event = new CustomEvent('addToCart', {
      detail: { product },
      bubbles: true
    });
    document.dispatchEvent(event);
    console.log('Adding to cart:', product);
  };

  const handleNextPage = () => {
    // Like reference implementation: clear items, increment page, scroll to top, load more
    const nextPage = currentPage + 1;
    setProducts([]);
    setCurrentPage(nextPage);
    window.scrollTo(0, 0);
    setLoading(true);
    setStopLoading(false);
    
    // Load with specific page number to ensure correct offset
    loadMoreProductsWithPage(nextPage);
  };

  // Build API filter from current UI filters and route
  const buildApiFilter = useCallback((isInitial: boolean = false, pageOverride?: number): ProductFilter => {
    const currentPath = window.location.pathname;
    const offset = isInitial ? (pageOverride || currentPage) * PRODUCTS_PER_PAGE : (currentPage * PRODUCTS_PER_PAGE) + products.length;
    
    const filter: ProductFilter = {
      limit: 25,
      offset,
      returnTotal: isInitial,
      partial: true
    };

    // Route-based format filtering
    if (currentPath === '/cd') {
      filter.formats = [1]; // CD only
    } else if (currentPath === '/vinyl') {
      filter.formats = [2, 3, 4, 5, 6]; // All vinyl formats
    }

    // Apply UI filters
    if (filters.search) {
      filter.name = filters.search; // Searches both artist and title
    }

    // Map genres from Hebrew to API IDs
    if (filters.genres.length > 0) {
      filter.genres = filters.genres.map(genre => GENRE_MAPPINGS[genre]).filter(id => id !== undefined);
    }

    // Map formats from UI to API IDs (only if not on specific route)
    if (filters.formats.length > 0 && currentPath !== '/cd' && currentPath !== '/vinyl') {
      filter.formats = filters.formats.map(format => CatalogAPI.HEBREW_FORMAT_MAPPINGS[format as keyof typeof CatalogAPI.HEBREW_FORMAT_MAPPINGS]).filter(id => id !== undefined);
    }

    // Parse price range
    const priceFilter = parsePriceRange(filters.priceRange);
    if (priceFilter.minPrice) filter.minPrice = priceFilter.minPrice;
    if (priceFilter.maxPrice) filter.maxPrice = priceFilter.maxPrice;

    // Apply sorting
    if (filters.sort && SORT_MAPPINGS[filters.sort]) {
      const sortValue = SORT_MAPPINGS[filters.sort];
      if (sortValue) {
        filter.sort = sortValue as any;
      }
    }

    return filter;
  }, [filters, currentPath, products.length, currentPage]);

  const loadMoreProducts = useCallback(async (isInitial: boolean = false) => {
    if (loading || (stopLoading && !isInitial)) return;

    console.log('🔄 Loading products with filters:', filters);

    setLoading(true);
    setError(null);

    try {
      const filter = buildApiFilter(isInitial);
      console.log('🔍 API Filter:', filter);
      
      const response = await CatalogAPI.fetchProductsWithFilter(filter);
      
      console.log('✅ Loaded products:', response.products.length, 'total available:', response.total);
      
      startTransition(() => {
        if (isInitial) {
          setProducts(response.products);
          if (response.total !== undefined) {
            setTotal(response.total);
          }
          setIsInitialLoad(false);
          setStopLoading(false);
        } else {
          const newProducts = [...products, ...response.products];
          setProducts(newProducts);
        }
        
        // Only stop loading if server returns no more products (like reference)
        if (response.products.length === 0) {
          setStopLoading(true);
        }
      });
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [buildApiFilter, products.length, loading, stopLoading]);

  // Helper function to load products with a specific page number
  const loadMoreProductsWithPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const filter = buildApiFilter(true, pageNum);
      console.log('🔍 API Filter for page', pageNum, ':', filter);
      
      const response = await CatalogAPI.fetchProductsWithFilter(filter);
      
      console.log('✅ Loaded products for page', pageNum, ':', response.products.length, 'total available:', response.total);
      
      startTransition(() => {
        setProducts(response.products);
        if (response.total !== undefined) {
          setTotal(response.total);
        }
        setStopLoading(response.products.length === 0);
      });
    } catch (err) {
      console.error('❌ Failed to load products for page', pageNum, ':', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [buildApiFilter]);

  // Scroll handler for infinite scroll (matching reference implementation logic)
  const handleScroll = useCallback(() => {
    if (!galleryRef.current || loading || stopLoading) return;
    
    // Use document height approach for more reliable detection
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if we're within 500px of bottom (like reference logic)
    if (scrollTop + windowHeight > documentHeight - 500 && products.length < MAX_INFINITE_SCROLL_PRODUCTS) {
      const now = Date.now();
      
      setLoading(true);
      
      // Add delay if too soon (like reference implementation)
      if (now - initialTime < 4000) {
        setTimeout(() => {
          loadMoreProducts(false);
        }, 3000);
      } else {
        loadMoreProducts(false);
      }
      
      setLastScrollTime(now);
    }
  }, [products.length, stopLoading, loading, initialTime, loadMoreProducts]);

  // Initial load
  useEffect(() => {
    setInitialTime(Date.now()); // Like reference's t0 = Date.now()
    loadMoreProducts(true);
  }, []);

  // Reload when route changes (but not page changes - those are handled by handleNextPage)
  useEffect(() => {
    if (!isInitialLoad && selectedItemIndex === undefined) { // Don't reload if showing product view!
      console.log('🔄 Route changed to:', currentPath, 'reloading products...');
      // Reset page number and clear products for new route
      setCurrentPage(0);
      setProducts([]);
      setTotal(null);
      setStopLoading(false);
      loadMoreProducts(true);
    }
  }, [currentPath, selectedItemIndex]);

  // Reload when filters change
  useEffect(() => {
    if (!isInitialLoad && selectedItemIndex === undefined) { // Don't reload if showing product view!
      console.log('🔄 Filters changed, reloading products...', filters);
      // Reset pagination and reload with filters
      setCurrentPage(0);
      setProducts([]);
      setTotal(null);
      setStopLoading(false);
      loadMoreProducts(true);
    }
  }, [filters, selectedItemIndex]);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Handle scroll position restoration when returning from product view (like reference's updated() method)
  useEffect(() => {
    // When selectedItemIndex becomes undefined (returning to gallery), restore scroll position
    let newScrollPos = 0;
    if (selectedItemIndex === undefined && scrollPosition) {
      newScrollPos = scrollPosition;
      setScrollPosition(0); // Clear saved position like reference: this.sp = undefined
    }
    
    setTimeout(() => {
      window.scrollTo(0, newScrollPos);
    }, 1); // Same 1ms delay as reference
  }, [selectedItemIndex]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // If we're showing product view, go back to gallery
      if (selectedItemIndex !== undefined) {
        setSelectedItemIndex(undefined);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedItemIndex]);

  // Render product view using existing ProductPage component
  const renderProductView = () => {
    if (selectedItemIndex === undefined || selectedItemIndex < 0 || selectedItemIndex >= products.length || !products[selectedItemIndex]) {
      console.log('Product view render failed:', { selectedItemIndex, productsLength: products.length });
      return null;
    }

    const selectedProduct = products[selectedItemIndex];
    console.log('Rendering ProductPage for:', selectedProduct.title);
    
    return (
      <ProductPage
        productId={selectedProduct.id}
        onClose={() => setSelectedItemIndex(undefined)}
        onAddToCart={handleAddToCart}
      />
    );
  };

  // Render gallery view (like reference's renderGallery)
  const renderGallery = () => {
    if (error && products.length === 0) {
      return (
        <div className={`${styles.productGallery} ${className || ''}`}>
          <div className={styles.error}>
            <p>שגיאה בטעינת המוצרים: {error}</p>
            <button 
              onClick={() => loadMoreProducts(true)}
              className={styles.retryButton}
            >
              נסה שוב
            </button>
          </div>
        </div>
      );
    }

    return (
      <div ref={galleryRef} className={`${styles.productGallery} ${className || ''}`}>
        <FilterHeader />
        
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onImageClick={handleImageClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>טוען מוצרים...</p>
          </div>
        )}

        {/* Next page button - show when we have exactly the page limit and not stopped loading */}
        {products.length === MAX_INFINITE_SCROLL_PRODUCTS && !stopLoading && (
          <div className={styles.paginationButton}>
            <button onClick={handleNextPage} className={styles.nextPageButton}>
              לדף {currentPage + 2} &gt;
            </button>
          </div>
        )}

        {/* Error handling */}
        {error && products.length > 0 && (
          <div className={styles.loadMoreError}>
            <p>שגיאה בטעינת מוצרים נוספים: {error}</p>
            <button 
              onClick={() => loadMoreProducts()}
              className={styles.retryButton}
            >
              נסה שוב
            </button>
          </div>
        )}
      </div>
    );
  };

  // Main render logic (like reference's render method)  
  console.log('Render: selectedItemIndex =', selectedItemIndex, 'products.length =', products.length);
  
  if (selectedItemIndex !== undefined) {
    console.log('Rendering product view for index:', selectedItemIndex);
    return renderProductView();
  } else {
    console.log('Rendering gallery view');
    return renderGallery();
  }
};