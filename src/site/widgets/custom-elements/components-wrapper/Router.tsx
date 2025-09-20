import React, { useState, useEffect } from 'react';
import { HomePage } from './HomePage';
import { ProductGallery } from './ProductGallery';
import { ProductPage } from './ProductPage';
import { ProductCard } from './ProductCard';
import { About } from './About';
import Navbar from './Navbar';
import Footer from './Footer';
import { CatalogAPI, type PartialProduct, type FullProduct, type ProductFilter } from './api';
import { ROUTES, createProductRoute, parseProductRoute } from './routes';
import styles from './element.module.css';

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
    currentView: 'home' | 'gallery' | 'product' | 'about';
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

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      forceUpdate({});
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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


  // Parse current route
  const getCurrentRoute = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path === ROUTES.HOME || path === '') {
      return { view: 'home' as const };
    } else if (path === ROUTES.CD) {
      // CD route - show gallery with CD format filter
      return { view: 'gallery' as const, filters: { format: 'cd' } };
    } else if (path === ROUTES.VINYL) {
      // Vinyl route - show gallery with vinyl format filter
      return { view: 'gallery' as const, filters: { format: 'vinyl' } };
    } else if (path === ROUTES.ABOUT) {
      return { view: 'about' as const };
    } else if (path === ROUTES.GALLERY) {
      const filters: Partial<FilterOptions> = {};
      searchParams.forEach((value, key) => {
        if (key in appState.galleryData.filters) {
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
          />
        );
      
      case 'gallery':
        const currentRoute = getCurrentRoute();
        let mode: 'all' | 'cd' | 'vinyl' = 'all';
        let effectiveFilters = appState.galleryData.filters;
        
        if (currentRoute.filters?.format === 'cd') {
          mode = 'cd';
          effectiveFilters = { ...appState.galleryData.filters, format: 'cd' };
        } else if (currentRoute.filters?.format === 'vinyl') {
          mode = 'vinyl';
          effectiveFilters = { ...appState.galleryData.filters, format: 'vinyl' };
        } else {
          // Fallback to query params for /gallery route
          const searchParams = new URLSearchParams(window.location.search);
          const format = searchParams.get('format');
          mode = format === 'cd' ? 'cd' : format === 'vinyl' ? 'vinyl' : 'all';
          if (format) {
            effectiveFilters = { ...appState.galleryData.filters, format };
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
        return <About />;
      
      default:
        return (
          <HomePage
            sections={appState.homeData.sections}
            loading={appState.homeData.loading}
            error={appState.homeData.error}
            onProductClick={(product: PartialProduct) => navigateToProduct(product.id)}
            onNavigateToGallery={() => navigateToGallery()}
          />
        );
    }
  };

  return (
    <div className={styles.appContainer}>
      <Navbar onNavigateToHome={navigateToHome} onNavigateToGallery={navigateToGallery} />
      <main className={styles.mainContent}>
        {renderCurrentPage()}
      </main>
      <Footer onNavigateToHome={navigateToHome} onNavigateToGallery={navigateToGallery} />
    </div>
  );
};

export default Router;
