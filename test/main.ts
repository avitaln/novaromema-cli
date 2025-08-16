import React from 'react';
import ReactDOM from 'react-dom/client';

// Patch the API modules to use proxy endpoints
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Redirect API calls to proxy
  if (url.includes('novaromemasync.fly.dev')) {
    const proxyUrl = url.replace('https://novaromemasync.fly.dev', '/api');
    return originalFetch(proxyUrl, init);
  }
  
  return originalFetch(input, init);
};

// Import React component
import '../src/site/widgets/custom-elements/components-wrapper/element.tsx';

// Lit component removed

// Simple router
function router() {
  console.log('Router called, path:', window.location.pathname);
  const path = window.location.pathname;
  const app = document.getElementById('app')!;
  
  // Update nav active state
  document.querySelectorAll('.nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
  
  if (path === '/gallery' || path === '/vinyl' || path === '/cd') {
    showReactComponent(app);
  } else if (path.startsWith('/product/')) {
    const productId = path.split('/product/')[1];
    console.log('Showing product page for ID:', productId);
    // Scroll to top immediately when navigating to product page
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
    showProductPage(app, productId);
  } else {
    showHome(app);
  }
}

// Make router globally available
(window as any).router = router;

function showHome(app: HTMLElement) {
  initializeReactComponent(app);
  import('../src/site/widgets/custom-elements/components-wrapper/element.tsx')
    .then((module) => {
      const CustomElement = module.default;
      const tagName = 'components-wrapper-element';
      if (!customElements.get(tagName)) {
        customElements.define(tagName, CustomElement);
      }
      const container = document.getElementById('react-root');
      if (container) {
        container.innerHTML = '';
        const element = document.createElement(tagName) as any;
        element.component = 'home';
        container.appendChild(element);
      }
    });
}

let reactRoot: any = null;
let isInitialized = false;

function initializeReactComponent(app: HTMLElement) {
  if (!isInitialized) {
    app.innerHTML = `
      <div class="header">
        <div class="nav">
          <a href="/" id="home-link">Home</a>
          <a href="/cd" id="cd-link">CD</a>
          <a href="/vinyl" id="vinyl-link">Vinyl</a>
        </div>
        <div class="header-title">Nova Roma Gallery</div>
        <div class="version">v26</div>
      </div>
      <div class="content gallery-page">
        <div id="react-root" class="gallery-container"></div>
      </div>
    `;
    
    const rootElement = document.getElementById('react-root');
    if (rootElement) {
      reactRoot = ReactDOM.createRoot(rootElement);
      isInitialized = true;
    }
  }
}

function showReactComponent(app: HTMLElement) {
  initializeReactComponent(app);
  
  // Load the ComponentsWrapper and register it
  import('../src/site/widgets/custom-elements/components-wrapper/element.tsx')
    .then((module) => {
      const CustomElement = module.default;
      
      // Register the custom element if not already registered
      const tagName = 'components-wrapper-element';
      if (!customElements.get(tagName)) {
        customElements.define(tagName, CustomElement);
      }
      
      if (reactRoot) {
        // Clear previous content and create new element
        const container = document.getElementById('react-root');
        if (container) {
          container.innerHTML = '';
          
          // Create and configure the element
          const element = document.createElement(tagName) as any;
          element.component = 'gallery';
          
          // Append directly to container
          container.appendChild(element);
        }
      }
    });
}

function showProductPage(app: HTMLElement, productId: string) {
  initializeReactComponent(app);
  
  // Load the ComponentsWrapper and register it
  import('../src/site/widgets/custom-elements/components-wrapper/element.tsx')
    .then((module) => {
      const CustomElement = module.default;
      
      // Register the custom element if not already registered
      const tagName = 'components-wrapper-element';
      if (!customElements.get(tagName)) {
        customElements.define(tagName, CustomElement);
      }
      
      if (reactRoot) {
        // Clear previous content and create new element
        const container = document.getElementById('react-root');
        if (container) {
          container.innerHTML = '';
          
          // Create and configure the element
          const element = document.createElement(tagName) as any;
          element.component = 'page';
          element.productId = productId;
          
          // Append directly to container
          container.appendChild(element);
        }
      }
    });
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

// Handle custom navigate events
window.addEventListener('navigate', router);

// Initial route
router();