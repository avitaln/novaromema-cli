import React, { useState, useEffect } from 'react';
import { HomePage } from './HomePage';
import { ProductGallery } from './ProductGallery';
import { ProductPage } from './ProductPage';
import { ProductCard } from './ProductCard';
import { TextPage } from './TextPage';
import { CartPage } from './CartPage';
import Navbar from './Navbar';
import Footer from './Footer';
import { CatalogAPI, type PartialProduct, type FullProduct, type ProductFilter } from './api';
import { ROUTES, createProductRoute, parseProductRoute } from './routes';
import { ABOUT_CONTENT, TERMS_CONTENT, ACCESSIBILITY_CONTENT } from './content.tsx';
import styles from './element.module.css';

// Valid filter keys for URL parameter parsing
const VALID_FILTER_KEYS = ['genre', 'special', 'condition', 'format', 'sort', 'search', 'searchType'];

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
    currentView: 'home' | 'gallery' | 'product' | 'about' | 'cart' | 'terms' | 'accessibility';
    previousView?: 'home' | 'gallery';
    productId?: string;
  };
}

interface RouterProps {
  initialState: SharedAppState;
  catalogAPI: typeof CatalogAPI;
  onStateChange: (newState: SharedAppState) => void;
  onFetchGalleryData: (isInitial?: boolean, pageOverride?: number, currentFilters?: FilterOptions, freshGalleryData?: SharedAppState['galleryData']) => void;
  onHandleGalleryLoadMore: () => void;
  onHandleGalleryNextPage: () => void;
  onHandleGalleryFiltersChange: (filters: FilterOptions) => void;
}

const Router: React.FC<RouterProps> = ({ 
  initialState, 
  catalogAPI, 
  onStateChange, 
  onFetchGalleryData, 
  onHandleGalleryLoadMore, 
  onHandleGalleryNextPage, 
  onHandleGalleryFiltersChange 
}) => {
  const [appState, setAppState] = useState<SharedAppState>(initialState);
  const [, forceUpdate] = useState({});

  // Handle browser back/forward navigation and URL changes
  useEffect(() => {
    const handlePopState = () => {
      console.log('🔄 Router: popstate event detected');
      console.log('🔄 Current URL:', window.location.href);
      
      // Force re-render first
      forceUpdate({});
      
      // Then check if we need to update gallery filters from URL
      // Use setTimeout to ensure the route parsing happens after state update
      setTimeout(() => {
        const route = getCurrentRoute();
        console.log('🔄 Parsed route:', route);
        
        if (route.view === 'gallery' && route.filters) {
          console.log('🔍 Router: Gallery route with filters detected');
          
          // Get current state using callback
          setAppState(currentState => {
            const urlFilters = route.filters || {};
            const currentFilters = currentState.galleryData.filters;
            
            console.log('🔍 URL filters:', urlFilters);
            console.log('🔍 Current filters:', currentFilters);
            
            // Build complete filter objects for comparison
            const urlFilterKeys = Object.keys(urlFilters);
            
            // Check if any filter actually changed
            const hasFilterChanges = urlFilterKeys.length > 0 && urlFilterKeys.some(key => {
              const urlValue = urlFilters[key as keyof FilterOptions];
              const currentValue = currentFilters[key as keyof FilterOptions];
              const changed = urlValue !== currentValue;
              if (changed) {
                console.log(`🔍 Filter "${key}" changed: "${currentValue}" -> "${urlValue}"`);
              }
              return changed;
            });
            
            if (hasFilterChanges) {
              console.log('✅ Router: Filter changes confirmed, updating gallery...');
              // Merge URL filters with current filters
              const updatedFilters = { ...currentFilters, ...urlFilters };
              console.log('✅ Updated filters:', updatedFilters);
              // Trigger the filter change handler
              onHandleGalleryFiltersChange(updatedFilters);
            } else {
              console.log('ℹ️ Router: No filter changes detected');
            }
            
            return currentState;
          });
        }
      }, 50); // Small delay to ensure URL is updated
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onHandleGalleryFiltersChange]);

  // Handle link clicks for SPA navigation
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link || link.hostname !== window.location.hostname) {
        return;
      }
      
      event.preventDefault();
      const path = link.pathname + link.search;
      window.history.pushState({}, '', path);
      forceUpdate({});
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Update parent state when local state changes
  useEffect(() => {
    onStateChange(appState);
  }, [appState, onStateChange]);

  // Data fetching functions
  const fetchHomeData = async () => {
    setAppState(prev => ({
      ...prev,
      homeData: { ...prev.homeData, loading: true, error: null }
    }));

    try {
      const sections = await catalogAPI.fetchHome();
      setAppState(prev => ({
        ...prev,
        homeData: { 
          sections, 
          loading: false, 
          error: null, 
          scrollPosition: prev.homeData.scrollPosition 
        }
      }));
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        homeData: { 
          ...prev.homeData, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch home data' 
        }
      }));
    }
  };

  const fetchProductData = async (productId: string) => {
    setAppState(prev => ({
      ...prev,
      productData: { ...prev.productData, loading: true, error: null }
    }));

    try {
      const product = await catalogAPI.fetchProductDetailsBySlug(productId);
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
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch product data' 
        }
      }));
    }
  };

  // Load data based on current route
  useEffect(() => {
    const route = getCurrentRoute();
    
    if (route.view === 'home' && appState.homeData.sections.length === 0 && !appState.homeData.loading) {
      fetchHomeData();
    } else if (route.view === 'gallery' && appState.galleryData.products.length === 0 && !appState.galleryData.loading && appState.galleryData.hasMore && appState.galleryData.total === null) {
      // Initialize gallery data - delegate to parent's fetchGalleryData
      console.log('🎯 Router: Initializing gallery data...');
      onFetchGalleryData(true);
    } else if (route.view === 'product' && route.productId && !appState.productData.currentProduct && !appState.productData.loading) {
      fetchProductData(route.productId);
    }
  }, [window.location.pathname, appState.galleryData.products.length, appState.galleryData.loading, appState.galleryData.hasMore, appState.galleryData.total]);


  // Navigation helper functions
  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    forceUpdate({});
  };

  const navigateToGallery = (filters?: Partial<FilterOptions>) => {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          searchParams.set(key, value);
        }
      });
    }
    const queryString = searchParams.toString();
    const path = `/gallery${queryString ? `?${queryString}` : ''}`;
    window.history.pushState({}, '', path);
    forceUpdate({});
  };

  const navigateToProduct = (productId: string) => {
    window.history.pushState({}, '', createProductRoute(productId));
    forceUpdate({});
  };

  const navigateToSlug = (slug: string) => {
    // Parse the slug to extract path and query parameters
    // Expected format: /all?special=newinsite, /vinyl?format=lp&condition=used, etc.
    window.history.pushState({}, '', slug);
    forceUpdate({});
  };

  const navigateToAbout = () => {
    window.history.pushState({}, '', ROUTES.ABOUT);
    forceUpdate({});
  };

  const navigateToCart = () => {
    window.history.pushState({}, '', ROUTES.CART);
    forceUpdate({});
  };

  const navigateToCd = () => {
    window.history.pushState({}, '', ROUTES.CD);
    forceUpdate({});
  };

  const navigateToVinyl = () => {
    window.history.pushState({}, '', ROUTES.VINYL);
    forceUpdate({});
  };

  const navigateToTerms = () => {
    window.history.pushState({}, '', ROUTES.TERMS);
    forceUpdate({});
  };

  const navigateToAccessibility = () => {
    window.history.pushState({}, '', ROUTES.ACCESSIBILITY);
    forceUpdate({});
  };


  // Parse current route
  const getCurrentRoute = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path === ROUTES.HOME || path === '') {
      return { view: 'home' as const };
    } else if (path === ROUTES.CD) {
      // CD route - show gallery with CD format filter, parse query params for other filters
      const filters: Partial<FilterOptions> = { format: 'cd' };
      searchParams.forEach((value, key) => {
        if (VALID_FILTER_KEYS.includes(key) && key !== 'format') { // Don't override format for CD route
          filters[key as keyof FilterOptions] = value;
        }
      });
      return { view: 'gallery' as const, filters };
    } else if (path === ROUTES.VINYL) {
      // Vinyl route - show gallery with vinyl format filter, parse query params for other filters
      const filters: Partial<FilterOptions> = { format: 'vinyl' };
      searchParams.forEach((value, key) => {
        if (VALID_FILTER_KEYS.includes(key) && key !== 'format') { // Don't override format for Vinyl route
          filters[key as keyof FilterOptions] = value;
        }
      });
      return { view: 'gallery' as const, filters };
    } else if (path === ROUTES.ALL) {
      // All route - show gallery with all formats, parse query params for filters
      const filters: Partial<FilterOptions> = {};
      searchParams.forEach((value, key) => {
        if (VALID_FILTER_KEYS.includes(key)) {
          filters[key as keyof FilterOptions] = value;
        }
      });
      return { view: 'gallery' as const, filters, mode: 'all' as const };
    } else if (path === ROUTES.ABOUT) {
      return { view: 'about' as const };
    } else if (path === ROUTES.CART) {
      return { view: 'cart' as const };
    } else if (path === ROUTES.TERMS) {
      return { view: 'terms' as const };
    } else if (path === ROUTES.ACCESSIBILITY) {
      return { view: 'accessibility' as const };
    } else if (path === ROUTES.GALLERY) {
      const filters: Partial<FilterOptions> = {};
      searchParams.forEach((value, key) => {
        if (VALID_FILTER_KEYS.includes(key)) {
          filters[key as keyof FilterOptions] = value;
        }
      });
      return { view: 'gallery' as const, filters };
    } else if (path.startsWith(`${ROUTES.PRODUCT}/`)) {
      const productId = parseProductRoute(path);
      return { view: 'product' as const, productId };
    }
    
    return { view: 'home' as const }; // fallback
  };

  // Render current page based on route
  const renderCurrentPage = () => {
    const route = getCurrentRoute();
    
    switch (route.view) {
      case 'home':
        return (
          <HomePage
            sections={appState.homeData.sections}
            loading={appState.homeData.loading}
            error={appState.homeData.error}
            onProductClick={(product: PartialProduct) => navigateToProduct(product.id)}
            onNavigateToGallery={() => navigateToGallery()}
            onNavigateToSlug={navigateToSlug}
          />
        );
      
      case 'gallery':
        const currentRoute = getCurrentRoute();
        let mode: 'all' | 'cd' | 'vinyl' = 'all';
        let effectiveFilters = appState.galleryData.filters;
        
        // Check if this is the /all route with explicit mode
        if (currentRoute.mode === 'all') {
          mode = 'all';
          // Create complete filter object with defaults, then merge route filters
          const defaultFilters: FilterOptions = {
            genre: 'all',
            special: 'all',
            condition: 'all',
            format: 'all',
            sort: 'new',
            search: '',
            searchType: 'name'
          };
          effectiveFilters = { ...defaultFilters, ...appState.galleryData.filters, ...currentRoute.filters };
        } else if (currentRoute.filters?.format === 'cd') {
          mode = 'cd';
          const defaultFilters: FilterOptions = {
            genre: 'all',
            special: 'all',
            condition: 'all',
            format: 'all',
            sort: 'new',
            search: '',
            searchType: 'name'
          };
          effectiveFilters = { ...defaultFilters, ...appState.galleryData.filters, format: 'cd' };
        } else if (currentRoute.filters?.format === 'vinyl') {
          mode = 'vinyl';
          const defaultFilters: FilterOptions = {
            genre: 'all',
            special: 'all',
            condition: 'all',
            format: 'all',
            sort: 'new',
            search: '',
            searchType: 'name'
          };
          effectiveFilters = { ...defaultFilters, ...appState.galleryData.filters, format: 'vinyl' };
        } else {
          // Fallback to query params for /gallery route
          const searchParams = new URLSearchParams(window.location.search);
          const format = searchParams.get('format');
          mode = format === 'cd' ? 'cd' : format === 'vinyl' ? 'vinyl' : 'all';
          const defaultFilters: FilterOptions = {
            genre: 'all',
            special: 'all',
            condition: 'all',
            format: 'all',
            sort: 'new',
            search: '',
            searchType: 'name'
          };
          if (format) {
            effectiveFilters = { ...defaultFilters, ...appState.galleryData.filters, format };
          } else {
            effectiveFilters = { ...defaultFilters, ...appState.galleryData.filters, ...currentRoute.filters };
          }
        }
        
        return (
          <ProductGallery
            products={appState.galleryData.products}
            filters={effectiveFilters}
            mode={mode}
            loading={appState.galleryData.loading}
            error={appState.galleryData.error}
            total={appState.galleryData.total}
            hasMore={appState.galleryData.hasMore}
            stopLoading={appState.galleryData.stopLoading}
            currentPage={appState.galleryData.currentPage}
            scrollPosition={appState.galleryData.scrollPosition}
            onProductClick={(product: PartialProduct) => navigateToProduct(product.id)}
            onFiltersChange={onHandleGalleryFiltersChange}
            onLoadMore={onHandleGalleryLoadMore}
            onNextPage={onHandleGalleryNextPage}
            onScrollPositionChange={(position: number) => {
              setAppState(prev => ({
                ...prev,
                galleryData: { ...prev.galleryData, scrollPosition: position }
              }));
            }}
          />
        );
      
      case 'product':
        const productRoute = getCurrentRoute();
        if (!productRoute.productId) {
          navigateToHome();
          return null;
        }
        return (
          <ProductPage
            product={appState.productData.currentProduct}
            loading={appState.productData.loading}
            error={appState.productData.error}
            onClose={() => {
              const previousView = appState.navigation.previousView;
              if (previousView === 'gallery') {
                navigateToGallery();
              } else {
                navigateToHome();
              }
            }}
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
      
      case 'about':
        return <TextPage content={ABOUT_CONTENT} />;
      
      case 'cart':
        return (
          <CartPage 
            onClose={() => {
              const previousView = appState.navigation.previousView;
              if (previousView === 'gallery') {
                navigateToGallery();
              } else {
                navigateToHome();
              }
            }}
          />
        );
      
      case 'terms':
        return <TextPage content={TERMS_CONTENT} />;
      
      case 'accessibility':
        return <TextPage content={ACCESSIBILITY_CONTENT} />;
      
      default:
        return (
          <HomePage
            sections={appState.homeData.sections}
            loading={appState.homeData.loading}
            error={appState.homeData.error}
            onProductClick={(product: PartialProduct) => navigateToProduct(product.id)}
            onNavigateToGallery={() => navigateToGallery()}
            onNavigateToSlug={navigateToSlug}
          />
        );
    }
  };

  return (
    <div className={styles.appContainer}>
      <Navbar 
        onNavigateToHome={navigateToHome} 
        onNavigateToGallery={navigateToGallery}
        onNavigateToAbout={navigateToAbout}
        onNavigateToCd={navigateToCd}
        onNavigateToVinyl={navigateToVinyl}
        onNavigateToCart={navigateToCart}
      />
      <main className={styles.mainContent}>
        {renderCurrentPage()}
      </main>
      <Footer 
        onNavigateToHome={navigateToHome} 
        onNavigateToGallery={navigateToGallery}
        onNavigateToAbout={navigateToAbout}
        onNavigateToVinyl={navigateToVinyl}
        onNavigateToCd={navigateToCd}
        onNavigateToTerms={navigateToTerms}
        onNavigateToAccessibility={navigateToAccessibility}
      />
    </div>
  );
};

export default Router;
