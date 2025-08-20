import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import { APP_NAME, WIDGET_VERSION } from '../../constants';
import { ProductGallery } from './ProductGallery';
import { ProductCard } from './ProductCard';
import { ProductPage } from './ProductPage';
import { HomePage } from './HomePage';
import { CatalogAPI, type PartialProduct, type FullProduct, type ProductFilter } from './api';
import styles from './element.module.css';

interface Props {
  displayName?: string;
  height?: string; // Height constraint for the gallery
  responsive?: string; // "true" to enable responsive height
  fillScreen?: string; // "false" to disable fill screen (enabled by default)
  component?: string; // "gallery" | "card" | "page" | "home"
  productId?: string; // For ProductCard or ProductPage
  productData?: string; // JSON string of product data for ProductCard
}

interface FilterOptions {
  genre: string;
  special: string;
  condition: string;
  format: string;
  sort: string;
  search: string;
  searchType: string;
}

interface HomeSection {
  title: string;
  list: PartialProduct[];
  buttonTitle?: string;
}

// Centralized app state
interface SharedAppState {
  // Home page data
  homeData: {
    sections: HomeSection[];
    loading: boolean;
    error: string | null;
    scrollPosition: number;
  };
  
  // Gallery data  
  galleryData: {
    products: PartialProduct[];
    filters: FilterOptions;
    currentPage: number;
    total: number | null;
    loading: boolean;
    error: string | null;
    scrollPosition: number;
    stopLoading: boolean;
    hasMore: boolean;
  };
  
  // Product page data
  productData: {
    currentProduct: FullProduct | null;
    loading: boolean;
    error: string | null;
  };
  
  // Navigation state
  navigation: {
    currentView: 'home' | 'gallery' | 'product' | 'card';
    previousView?: 'home' | 'gallery';
    productId?: string;
  };
}

// Genre mappings from reference constants.js
const GENRE_MAPPINGS: Record<string, number> = {
  'all': 0,
  'israeli': 1,
  'rock-pop': 2,
  'alternative-rock': 3,
  'newwave-postpunk-gothic': 4,
  'jazz-blues': 5,
  'soul-funk': 6,
  'electronic': 7,
  'trance': 8,
  'experimental-industrial-noise': 9,
  'hip-hop': 10,
  'reggae-dub': 11,
  'hardcore-punk': 12,
  'metal': 13,
  'doom-sludge-stoner': 14,
  'prog-psychedelic': 15,
  'folk-country': 16,
  'world': 17,
  'classical': 18,
  'soundtracks': 19
};

// Format mappings from reference constants.js  
const FORMAT_MAPPINGS: Record<string, number> = {
  'all': 0,
  'cd': 1,
  'lp': 2,
  '12': 3,
  '10': 4,
  '7': 5,
  'cassette': 6
};

// Condition mappings
const CONDITION_MAPPINGS: Record<string, string> = {
  'all': '',
  'new': 'new',
  'used': 'used'
};

// Special category mappings  
const SPECIAL_MAPPINGS: Record<string, string> = {
  'all': '',
  'newinsite': 'newinsite',
  'preorder': 'preorder', 
  'recommended': 'recommended',
  'classics': 'classics',
  'cheap': 'cheap',
  'rare': 'rare'
};


// Constants
const PRODUCTS_PER_PAGE = 25;

function CustomElement({ displayName, height, responsive, fillScreen, component = 'gallery', productId, productData }: Props) {
  // Initialize filters from URL parameters
  const initializeFiltersFromUrl = (): FilterOptions => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      genre: urlParams.get('genre') || 'all',
      special: urlParams.get('special') || 'all',
      condition: urlParams.get('condition') || 'all',
      format: urlParams.get('format') || 'all',
      sort: urlParams.get('sort') || 'new',
      search: urlParams.get('search') || '',
      searchType: urlParams.get('searchType') || 'name'
    };
  };

  // Initialize shared app state
  const [appState, setAppState] = useState<SharedAppState>({
    homeData: { 
      sections: [], 
      loading: false, 
      error: null, 
      scrollPosition: 0 
    },
    galleryData: { 
      products: [], 
      filters: initializeFiltersFromUrl(),
      currentPage: 0, 
      total: null, 
      loading: false, 
      error: null, 
      scrollPosition: 0, 
      stopLoading: false,
      hasMore: true
    },
    productData: { 
      currentProduct: null, 
      loading: false, 
      error: null 
    },
    navigation: { 
      currentView: component as any || 'gallery'
    }
  });

  // For backward compatibility with component prop
  const [staticProduct, setStaticProduct] = useState<any>(null);
  const PRODUCTS_PER_PAGE = 500; // Fixed: 500 products per page for pagination
  const MAX_INFINITE_SCROLL_PRODUCTS = 500;

  useEffect(() => {
    if (productData) {
      try {
        setStaticProduct(JSON.parse(productData));
      } catch (e) {
        console.error('Failed to parse product data:', e);
      }
    }
  }, [productData]);

  // Update navigation when component prop changes (for external control)
  useEffect(() => {
    if (component) {
      setAppState(prev => ({
        ...prev,
        navigation: { 
          ...prev.navigation, 
          currentView: component as any,
          productId: productId || prev.navigation.productId
        }
      }));
    }
  }, [component, productId]);

  // ===== DATA FETCHING FUNCTIONS =====
  
  const fetchHomeData = useCallback(async () => {
    console.log('🏠 Fetching home data...');
    setAppState(prev => ({
      ...prev,
      homeData: { ...prev.homeData, loading: true, error: null }
    }));

    try {
      const sections = await CatalogAPI.fetchHome();
      setAppState(prev => ({
        ...prev,
        homeData: { 
          ...prev.homeData, 
          sections, 
          loading: false 
        }
      }));
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        homeData: { 
          ...prev.homeData, 
          error: error instanceof Error ? error.message : 'Failed to load home data',
          loading: false 
        }
      }));
    }
  }, []);

  // Parse price range from Hebrew text to min/max values
  const parsePriceRange = useCallback((priceRange: string): { minPrice?: number; maxPrice?: number } => {
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
  }, []);

  // buildApiFilter function removed - logic inlined in fetchGalleryData to avoid circular dependency

  const fetchGalleryData = useCallback(async (isInitial: boolean = false, pageOverride?: number, currentFilters?: FilterOptions, freshGalleryData?: typeof appState.galleryData) => {
    const galleryData = freshGalleryData || appState.galleryData;
    const filtersToUse = currentFilters || galleryData.filters;
    
    if (galleryData.loading || (galleryData.stopLoading && !isInitial)) {
      console.log('🚫 Skipping fetch - loading:', galleryData.loading, 'stopLoading:', galleryData.stopLoading, 'isInitial:', isInitial);
      return;
    }

    console.log('🖼️ Fetching gallery data...', { 
      isInitial, 
      pageOverride, 
      currentPage: galleryData.currentPage,
      productsLength: galleryData.products.length,
      callStack: new Error().stack?.split('\n')[2]?.trim() // Show where this was called from
    });
    
    setAppState(prev => ({
      ...prev,
      galleryData: { ...prev.galleryData, loading: true, error: null }
    }));

    try {
      // Build API filter inline to avoid circular dependency
      const currentPathNow = window.location.pathname;
      
      let offset;
      if (isInitial) {
        const page = pageOverride ?? galleryData.currentPage;
        offset = page * PRODUCTS_PER_PAGE;
        console.log(`📊 Initial load - page: ${page} (override: ${pageOverride}, current: ${galleryData.currentPage}) → offset: ${offset}`);
      } else {
        offset = (galleryData.currentPage * PRODUCTS_PER_PAGE) + galleryData.products.length;
        console.log(`📊 Infinite scroll - page: ${galleryData.currentPage}, products: ${galleryData.products.length} → offset: ${offset}`);
      }
      
      const filter: ProductFilter = {
        limit: 25,
        offset,
        returnTotal: isInitial,
        partial: true
      };

      // Route-based format filtering
      if (currentPathNow === '/cd') {
        filter.formats = [1]; // CD only
      } else if (currentPathNow === '/vinyl') {
        filter.formats = [2, 3, 4, 5, 6]; // All vinyl formats
      }

      // Apply UI filters - handle different search types
      if (filtersToUse.search) {
        const searchType = filtersToUse.searchType || 'name';
        switch (searchType) {
          case 'title':
            filter.title = filtersToUse.search;
            break;
          case 'artist':
            filter.artist = filtersToUse.search;
            break;
          case 'name':
          default:
            filter.name = filtersToUse.search;
            break;
        }
      }

      // Apply genre filter  
      if (filtersToUse.genre && filtersToUse.genre !== 'all') {
        const genreId = GENRE_MAPPINGS[filtersToUse.genre];
        if (genreId !== undefined && genreId !== 0) {
          filter.genres = [genreId];
        }
      }

      // Apply format filter (only if not on specific route)
      if (filtersToUse.format && filtersToUse.format !== 'all' && currentPathNow !== '/cd' && currentPathNow !== '/vinyl') {
        const formatId = FORMAT_MAPPINGS[filtersToUse.format];
        if (formatId && formatId !== 0) {
          filter.formats = [formatId];
        }
      }

      // Apply condition filter
      if (filtersToUse.condition && filtersToUse.condition !== 'all') {
        if (filtersToUse.condition === 'new') {
          filter.isNew = true;
        } else if (filtersToUse.condition === 'used') {
          filter.isNew = false;
        }
      }

      // Apply special category filter
      if (filtersToUse.special && filtersToUse.special !== 'all') {
        const specialMappings: Record<string, number> = {
          'newinsite': 1,
          'preorder': 2, 
          'recommended': 3,
          'classics': 4,
          'cheap': 5,
          'rare': 6
        };
        const specialId = specialMappings[filtersToUse.special];
        if (specialId) {
          filter.specials = [specialId];
        }
      }

      // Apply sorting (skip "new" since it's the default)
      if (filtersToUse.sort && filtersToUse.sort !== 'new') {
        const sortValue = filtersToUse.sort;
        if (sortValue) {
          filter.sort = sortValue as any;
        }
      }
      
      console.log('🔍 API Filter:', { 
        offset: filter.offset, 
        limit: filter.limit, 
        returnTotal: filter.returnTotal,
        isInitial: isInitial,
        genreInFilter: filtersToUse.genre, 
        genresArray: filter.genres
      });
      
      const response = await CatalogAPI.fetchProductsWithFilter(filter);
      const finalProductsCount = isInitial ? response.products.length : galleryData.products.length + response.products.length;
      console.log('✅ API Response:', {
        received: response.products.length,
        totalFromAPI: response.total,
        isInitial,
        returnedTotal: isInitial,
        finalProductsCount,
        willStopLoading: response.products.length === 0,
        willHaveMore: response.products.length > 0
      });

      setAppState(prev => ({
        ...prev,
        galleryData: {
          ...prev.galleryData,
          products: isInitial ? response.products : (() => {
            // Check for duplicates and warn about server-side issue
            const existingIds = new Set(prev.galleryData.products.map(p => p.id));
            const duplicates = response.products.filter(p => existingIds.has(p.id));
            
            if (duplicates.length > 0) {
              console.warn('🚨 SERVER ISSUE: Received duplicate products from API:', {
                duplicateCount: duplicates.length,
                duplicateIds: duplicates.map(p => p.id),
                existingProductsCount: prev.galleryData.products.length,
                newProductsCount: response.products.length,
                currentPage: prev.galleryData.currentPage,
                duplicateProducts: duplicates
              });
            }
            
            return [...prev.galleryData.products, ...response.products];
          })(),
          total: (() => {
            // ONLY use response.total on initial load (first page)
            // ALWAYS ignore response.total on subsequent pages, regardless of value
            let newTotal;
            if (isInitial) {
              newTotal = response.total !== undefined ? response.total : prev.galleryData.total;
            } else {
              // Infinite scroll: ALWAYS preserve previous total, ignore API response
              newTotal = prev.galleryData.total;
            }
            
            console.log('📊 Total handling:', {
              responseTotal: response.total,
              previousTotal: prev.galleryData.total,
              finalTotal: newTotal,
              isInitial,
              logic: isInitial ? 'use-api-total' : 'ignore-api-preserve-previous'
            });
            return newTotal;
          })(),
          loading: false,
          stopLoading: response.products.length === 0,
          hasMore: response.products.length > 0 // Re-enable infinite scroll when we have data
        }
      }));

    } catch (error) {
      console.error('❌ Failed to load gallery data:', error);
      setAppState(prev => ({
        ...prev,
        galleryData: { 
          ...prev.galleryData, 
          error: error instanceof Error ? error.message : 'Failed to load gallery data',
          loading: false 
        }
      }));
    }
  }, []); // Remove buildApiFilter dependency to avoid circular dependency

  const fetchProductData = useCallback(async (slug: string) => {
    console.log('📄 Fetching product data for slug:', slug);
    setAppState(prev => ({
      ...prev,
      productData: { ...prev.productData, loading: true, error: null }
    }));

    try {
      const product = await CatalogAPI.fetchProductDetailsBySlug(slug);
      setAppState(prev => ({
        ...prev,
        productData: { 
          currentProduct: product, 
          loading: false, 
          error: null 
        }
      }));
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        productData: { 
          ...prev.productData, 
          error: error instanceof Error ? error.message : 'Failed to load product',
          loading: false 
        }
      }));
    }
  }, []);

  // ===== NAVIGATION FUNCTIONS =====
  
  const navigateToProduct = useCallback((product: PartialProduct, sourceView?: 'home' | 'gallery') => {
    if (!product.slug) {
      console.error('❌ Product has no slug:', product);
      return;
    }
    
    console.log('🔄 Navigating to product slug:', product.slug);
    
    // Update browser URL (same format as ref/product-gallery.js)
    window.history.pushState({ productPage: product.slug }, '', `/product-page/${product.slug}`);
    
    // Save current scroll position
    const currentScrollPosition = window.scrollY;
    const currentView = sourceView || appState.navigation.currentView;
    
    if (currentView === 'home') {
      setAppState(prev => ({
        ...prev,
        homeData: { ...prev.homeData, scrollPosition: currentScrollPosition },
        navigation: { currentView: 'product', previousView: 'home', productId: product.slug! }
      }));
    } else if (currentView === 'gallery') {
      setAppState(prev => ({
        ...prev,
        galleryData: { ...prev.galleryData, scrollPosition: currentScrollPosition },
        navigation: { currentView: 'product', previousView: 'gallery', productId: product.slug! }
      }));
    }
    
    fetchProductData(product.slug);
  }, [appState.navigation.currentView, fetchProductData]);

  const navigateBack = useCallback(() => {
    const previousView = appState.navigation.previousView || 'gallery';
    console.log('🔙 Navigating back to:', previousView);
    
    // Update browser URL when going back
    const backUrl = previousView === 'home' ? '/' : '/gallery';
    window.history.pushState({}, '', backUrl);
    
    setAppState(prev => ({
      ...prev,
      navigation: { currentView: previousView }
    }));
    
    // Restore scroll position instantly
    requestAnimationFrame(() => {
      const scrollPos = previousView === 'home' 
        ? appState.homeData.scrollPosition 
        : appState.galleryData.scrollPosition;
      window.scrollTo(0, scrollPos);
    });
  }, [appState.navigation.previousView, appState.homeData.scrollPosition, appState.galleryData.scrollPosition]);

  const navigateToGallery = useCallback(() => {
    console.log('🖼️ Navigating to gallery');
    setAppState(prev => ({
      ...prev,
      navigation: { currentView: 'gallery' }
    }));
  }, []);

  const navigateToHome = useCallback(() => {
    console.log('🏠 Navigating to home');
    setAppState(prev => ({
      ...prev,
      navigation: { currentView: 'home' }
    }));
  }, []);

  // ===== GALLERY SPECIFIC FUNCTIONS =====
  
  const handleGalleryLoadMore = useCallback(() => {
    setAppState(prevState => {
      const { loading, products } = prevState.galleryData;
      if (loading) {
        console.log('🚫 Load more blocked - already loading');
        return prevState;
      }
      console.log('📄 Load more triggered - current products:', products.length);
      // Pass fresh state to avoid stale closure in fetchGalleryData
      setTimeout(() => fetchGalleryData(false, undefined, undefined, prevState.galleryData), 0);
      return prevState;
    });
  }, [fetchGalleryData]);

  const handleGalleryFiltersChange = useCallback((newFilters: FilterOptions) => {
    console.log('🔍 Gallery filters changed:', newFilters);
    
    // Update URL parameters
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    
    // Clear existing filter params and add new ones
    ['genre', 'special', 'condition', 'format', 'sort', 'search', 'searchType'].forEach(key => {
      params.delete(key);
    });
    
    // Add non-default filter values to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && !(key === 'sort' && value === 'new') && !(key === 'searchType' && value === 'name')) {
        params.set(key, value);
      }
    });
    
    // Update browser URL without triggering navigation
    window.history.replaceState(null, '', currentUrl.toString());
    
    // Scroll to top immediately (like next page behavior)
    window.scrollTo(0, 0);
    
    setAppState(prev => ({
      ...prev,
      galleryData: {
        ...prev.galleryData,
        filters: newFilters,
        products: [], // Reset products for new filters
        currentPage: 0,
        stopLoading: false,
        hasMore: true,
        scrollPosition: 0
      }
    }));
    // Fetch with new filters
    setTimeout(() => fetchGalleryData(true, undefined, newFilters, undefined), 0);
  }, [fetchGalleryData]);

  const handleGalleryNextPage = useCallback(() => {
    console.log('📄 Next Page clicked - going to page', appState.galleryData.currentPage + 1);
    const nextPage = appState.galleryData.currentPage + 1;
    
    // Clear products, set loading, and suppress infinite scroll during pagination
    setAppState(prev => ({
      ...prev,
      galleryData: {
        ...prev.galleryData,
        products: [],
        currentPage: nextPage,
        loading: true,
        stopLoading: false,
        hasMore: false, // Temporarily disable infinite scroll
        scrollPosition: 0
      }
    }));
    
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Load with specific page number with slight delay to avoid conflicts
    setTimeout(() => {
      fetchGalleryData(true, nextPage, undefined, undefined);
    }, 100);
  }, [appState.galleryData.currentPage, fetchGalleryData]);

  // ===== INITIALIZATION =====
  
  useEffect(() => {
    const currentView = appState.navigation.currentView;
    
    // Initialize data based on current view
    if (currentView === 'home' && appState.homeData.sections.length === 0 && !appState.homeData.loading) {
      fetchHomeData();
    } else if (currentView === 'gallery' && appState.galleryData.products.length === 0 && !appState.galleryData.loading && appState.galleryData.hasMore && appState.galleryData.total === null) {
      // Only initialize if hasMore is true AND we haven't fetched before (total === null) 
      // This prevents conflicts with filter changes which also reset products to []
      console.log('🎯 Initializing gallery data...');
      fetchGalleryData(true, undefined, undefined, undefined);
    } else if (currentView === 'product' && appState.navigation.productId && !appState.productData.currentProduct && !appState.productData.loading) {
      fetchProductData(appState.navigation.productId);
    }
  }, [appState.navigation.currentView, appState.navigation.productId, fetchHomeData, fetchGalleryData, fetchProductData]);

  // ===== RENDER FUNCTIONS =====
  
  const renderComponent = () => {
    const { currentView } = appState.navigation;
    
    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            sections={appState.homeData.sections}
            loading={appState.homeData.loading}
            error={appState.homeData.error}
            onProductClick={(product) => navigateToProduct(product, 'home')}
            onNavigateToGallery={navigateToGallery}
          />
        );
        
      case 'gallery':
        const currentPath = window.location.pathname;
        return (
          <ProductGallery 
            products={appState.galleryData.products}
            filters={appState.galleryData.filters}
            mode={currentPath === '/cd' ? 'cd' : currentPath === '/vinyl' ? 'vinyl' : 'all'}
            loading={appState.galleryData.loading}
            error={appState.galleryData.error}
            total={appState.galleryData.total}
            hasMore={appState.galleryData.hasMore}
            stopLoading={appState.galleryData.stopLoading}
            currentPage={appState.galleryData.currentPage}
            scrollPosition={appState.galleryData.scrollPosition}
            onProductClick={(product) => navigateToProduct(product, 'gallery')}
            onFiltersChange={handleGalleryFiltersChange}
            onLoadMore={handleGalleryLoadMore}
            onNextPage={handleGalleryNextPage}
            onScrollPositionChange={(position) => {
              setAppState(prev => ({
                ...prev,
                galleryData: { ...prev.galleryData, scrollPosition: position }
              }));
            }}
          />
        );
        
      case 'product':
        return (
          <ProductPage 
            product={appState.productData.currentProduct}
            loading={appState.productData.loading}
            error={appState.productData.error}
            onClose={navigateBack}
            onAddToCart={(product) => {
              // Handle add to cart
              console.log('Adding to cart:', product);
              const event = new CustomEvent('addToCart', {
                detail: { product },
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
          />
        );
        
      case 'card':
        if (staticProduct) {
          return <ProductCard product={staticProduct} />;
        }
        return <div>No product data provided for ProductCard</div>;
        
      default:
        const defaultPath = window.location.pathname;
        return (
          <ProductGallery 
            products={appState.galleryData.products}
            filters={appState.galleryData.filters}
            mode={defaultPath === '/cd' ? 'cd' : defaultPath === '/vinyl' ? 'vinyl' : 'all'}
            loading={appState.galleryData.loading}
            error={appState.galleryData.error}
            total={appState.galleryData.total}
            hasMore={appState.galleryData.hasMore}
            stopLoading={appState.galleryData.stopLoading}
            currentPage={appState.galleryData.currentPage}
            scrollPosition={appState.galleryData.scrollPosition}
            onProductClick={(product) => navigateToProduct(product, 'gallery')}
            onFiltersChange={handleGalleryFiltersChange}
            onLoadMore={handleGalleryLoadMore}
            onNextPage={handleGalleryNextPage}
            onScrollPositionChange={(position) => {
              setAppState(prev => ({
                ...prev,
                galleryData: { ...prev.galleryData, scrollPosition: position }
              }));
            }}
          />
        );
    }
  };
  
  return (
    <div 
      className={styles.root} 
      data-fill-screen={appState.navigation.currentView === 'product' ? "true" : fillScreen !== "false"}
    >
      {renderComponent()}
    </div>
  );
}

const customElement = reactToWebComponent(
  CustomElement,
  React,
  ReactDOMClient as any,
  {
    props: {
      displayName: 'string',
      height: 'string',
      responsive: 'string',
      fillScreen: 'string',
      component: 'string',
      productId: 'string',
      productData: 'string',
    },
  }
);

export default customElement;