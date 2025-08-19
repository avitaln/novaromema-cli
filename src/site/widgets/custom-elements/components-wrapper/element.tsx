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
  search: string;
  genres: string[];
  labels: string[];
  formats: string[];
  years: string[];
  priceRange: string;
  sort: string;
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

// English genre labels mapped to API IDs (from ProductGallery.tsx)
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

const SORT_MAPPINGS: Record<string, string> = {
  'מחיר נמוך לגבוה': 'pricelow',
  'מחיר גבוה לנמוך': 'pricehigh',
  'לפי אמן': 'artist',
  'לפי כותרת': 'title',
  'הכי חדש': ''
};

function CustomElement({ displayName, height, responsive, fillScreen, component = 'gallery', productId, productData }: Props) {
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
      filters: {
        search: '',
        genres: [],
        labels: [],
        formats: [],
        years: [],
        priceRange: '',
        sort: ''
      },
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

  const buildApiFilter = useCallback((isInitial: boolean = false, pageOverride?: number): ProductFilter => {
    const { galleryData } = appState;
    const currentPathNow = window.location.pathname; // Read current path when filter is built
    
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

    // Apply UI filters
    if (galleryData.filters.search) {
      filter.name = galleryData.filters.search; // Searches both artist and title
    }

    // Map genres from Hebrew to API IDs
    if (galleryData.filters.genres.length > 0) {
      filter.genres = galleryData.filters.genres.map(genre => GENRE_MAPPINGS[genre]).filter(id => id !== undefined);
    }

    // Map formats from UI to API IDs (only if not on specific route)
    if (galleryData.filters.formats.length > 0 && currentPathNow !== '/cd' && currentPathNow !== '/vinyl') {
      filter.formats = galleryData.filters.formats.map(format => CatalogAPI.HEBREW_FORMAT_MAPPINGS[format as keyof typeof CatalogAPI.HEBREW_FORMAT_MAPPINGS]).filter(id => id !== undefined);
    }

    // Parse price range
    const priceFilter = parsePriceRange(galleryData.filters.priceRange);
    if (priceFilter.minPrice) filter.minPrice = priceFilter.minPrice;
    if (priceFilter.maxPrice) filter.maxPrice = priceFilter.maxPrice;

    // Apply sorting
    if (galleryData.filters.sort && SORT_MAPPINGS[galleryData.filters.sort]) {
      const sortValue = SORT_MAPPINGS[galleryData.filters.sort];
      if (sortValue) {
        filter.sort = sortValue as any;
      }
    }

    return filter;
  }, [appState.galleryData, parsePriceRange]);

  const fetchGalleryData = useCallback(async (isInitial: boolean = false, pageOverride?: number) => {
    const { galleryData } = appState;
    
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
      const filter = buildApiFilter(isInitial, pageOverride);
      console.log('🔍 API Filter with offset:', filter.offset, 'limit:', filter.limit, 'full filter:', filter);
      
      const response = await CatalogAPI.fetchProductsWithFilter(filter);
      const finalProductsCount = isInitial ? response.products.length : galleryData.products.length + response.products.length;
      console.log('✅ API Response:', {
        received: response.products.length,
        totalAvailable: response.total,
        isInitial,
        finalProductsCount,
        willStopLoading: response.products.length === 0,
        willHaveMore: response.products.length > 0
      });

      setAppState(prev => ({
        ...prev,
        galleryData: {
          ...prev.galleryData,
          products: isInitial ? response.products : [...prev.galleryData.products, ...response.products],
          total: response.total !== undefined ? response.total : prev.galleryData.total,
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
  }, [buildApiFilter]);

  const fetchProductData = useCallback(async (productId: string) => {
    console.log('📄 Fetching product data for:', productId);
    setAppState(prev => ({
      ...prev,
      productData: { ...prev.productData, loading: true, error: null }
    }));

    try {
      const product = await CatalogAPI.fetchProductDetails(productId);
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
  
  const navigateToProduct = useCallback((productId: string, sourceView?: 'home' | 'gallery') => {
    console.log('🔄 Navigating to product:', productId);
    
    // Save current scroll position
    const currentScrollPosition = window.scrollY;
    const currentView = sourceView || appState.navigation.currentView;
    
    if (currentView === 'home') {
      setAppState(prev => ({
        ...prev,
        homeData: { ...prev.homeData, scrollPosition: currentScrollPosition },
        navigation: { currentView: 'product', previousView: 'home', productId }
      }));
    } else if (currentView === 'gallery') {
      setAppState(prev => ({
        ...prev,
        galleryData: { ...prev.galleryData, scrollPosition: currentScrollPosition },
        navigation: { currentView: 'product', previousView: 'gallery', productId }
      }));
    }
    
    fetchProductData(productId);
  }, [appState.navigation.currentView, fetchProductData]);

  const navigateBack = useCallback(() => {
    const previousView = appState.navigation.previousView || 'gallery';
    console.log('🔙 Navigating back to:', previousView);
    
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
    const { loading, products } = appState.galleryData;
    if (loading) {
      console.log('🚫 Load more blocked - already loading');
      return;
    }
    console.log('📄 Load more triggered - current products:', products.length);
    fetchGalleryData(false);
  }, [fetchGalleryData, appState.galleryData]);

  const handleGalleryFiltersChange = useCallback((newFilters: FilterOptions) => {
    console.log('🔍 Gallery filters changed:', newFilters);
    setAppState(prev => ({
      ...prev,
      galleryData: {
        ...prev.galleryData,
        filters: newFilters,
        products: [], // Reset products for new filters
        currentPage: 0,
        stopLoading: false,
        hasMore: true
      }
    }));
    // Fetch with new filters
    setTimeout(() => fetchGalleryData(true), 0);
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
      fetchGalleryData(true, nextPage);
    }, 100);
  }, [appState.galleryData.currentPage, fetchGalleryData]);

  // ===== INITIALIZATION =====
  
  useEffect(() => {
    const currentView = appState.navigation.currentView;
    
    // Initialize data based on current view
    if (currentView === 'home' && appState.homeData.sections.length === 0 && !appState.homeData.loading) {
      fetchHomeData();
    } else if (currentView === 'gallery' && appState.galleryData.products.length === 0 && !appState.galleryData.loading && appState.galleryData.hasMore) {
      // Only initialize if hasMore is true (prevents conflicts with pagination which sets hasMore: false)
      console.log('🎯 Initializing gallery data...');
      fetchGalleryData(true);
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
            onProductClick={(product) => navigateToProduct(product.id, 'home')}
            onNavigateToGallery={navigateToGallery}
          />
        );
        
      case 'gallery':
        return (
          <ProductGallery 
            products={appState.galleryData.products}
            filters={appState.galleryData.filters}
            loading={appState.galleryData.loading}
            error={appState.galleryData.error}
            total={appState.galleryData.total}
            hasMore={appState.galleryData.hasMore}
            stopLoading={appState.galleryData.stopLoading}
            currentPage={appState.galleryData.currentPage}
            scrollPosition={appState.galleryData.scrollPosition}
            onProductClick={(product) => navigateToProduct(product.id, 'gallery')}
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
        return (
          <ProductGallery 
            products={appState.galleryData.products}
            filters={appState.galleryData.filters}
            loading={appState.galleryData.loading}
            error={appState.galleryData.error}
            total={appState.galleryData.total}
            hasMore={appState.galleryData.hasMore}
            stopLoading={appState.galleryData.stopLoading}
            currentPage={appState.galleryData.currentPage}
            scrollPosition={appState.galleryData.scrollPosition}
            onProductClick={(product) => navigateToProduct(product.id, 'gallery')}
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