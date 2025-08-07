import React from 'react';
import ReactDOM from 'react-dom/client';

// Import proxy API for testing
import { MockCatalogAPI } from './api-proxy';

// Patch the API modules to use proxy endpoints with fallback to mock data
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Redirect API calls to proxy
  if (url.includes('novaromemasync.fly.dev')) {
    const proxyUrl = url.replace('https://novaromemasync.fly.dev', '/api');
    
    try {
      const response = await originalFetch(proxyUrl, init);
      if (response.ok) {
        return response;
      }
      throw new Error(`Proxy failed: ${response.status}`);
    } catch (error) {
      // Return mock data as fallback
      const mockResponse = await MockCatalogAPI.fetchProducts(0, 25, true);
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return originalFetch(input, init);
};

// Import React component
import '../src/site/widgets/custom-elements/components-wrapper/element.tsx';

// Lit component removed

// Simple router
function router() {
  const path = window.location.pathname;
  const app = document.getElementById('app')!;
  
  // Update nav active state
  document.querySelectorAll('.nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
  
  if (path === '/gallery') {
    showReactComponent(app);
  } else {
    showHome(app);
  }
}

function showHome(app: HTMLElement) {
  app.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center;">
      <div>
        <h1>Product Gallery</h1>
        <p>React-based product gallery component</p>
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
          <a href="/gallery" style="padding: 1rem 2rem; background: #61dafb; color: #000; text-decoration: none; border-radius: 4px;">🖼️ Gallery</a>
        </div>
      </div>
    </div>
  `;
}

function showReactComponent(app: HTMLElement) {
  app.innerHTML = '<div id="react-root" style="width: 100%; height: 100%;"></div>';
  
  // Create React wrapper
  const ReactWrapper = React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      backgroundColor: '#242A35',
      color: '#fcfdfd',
      padding: '1rem 0',
    }
  }, [
    React.createElement('h2', {
      key: 'header',
      style: { textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }
    }, 'React Component - novaromema-cli version: 25'),
    React.createElement('div', { key: 'gallery', id: 'react-gallery-container' })
  ]);

  const reactRoot = document.getElementById('react-root');
  if (reactRoot) {
    const root = ReactDOM.createRoot(reactRoot);
    root.render(ReactWrapper);
    
    // Load the actual React gallery
    import('../src/site/widgets/custom-elements/components-wrapper/ProductGallery.tsx')
      .then(({ ProductGallery }) => {
        const galleryContainer = document.getElementById('react-gallery-container');
        if (galleryContainer) {
          const galleryRoot = ReactDOM.createRoot(galleryContainer);
          galleryRoot.render(React.createElement(ProductGallery));
        }
      });
  }
}



// Handle navigation
document.addEventListener('click', (e) => {
  const target = e.target as HTMLAnchorElement;
  if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
    e.preventDefault();
    window.history.pushState({}, '', target.href);
    router();
  }
});

// Handle back/forward
window.addEventListener('popstate', router);

// Initial route
router();