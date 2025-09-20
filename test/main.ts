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

// Import and initialize the custom element
import '../src/site/widgets/custom-elements/components-wrapper/element.tsx';

// Initialize the app
function initApp() {
  // Load the ComponentsWrapper and register it
  import('../src/site/widgets/custom-elements/components-wrapper/element.tsx')
    .then((module) => {
      const CustomElement = module.default;
      
      // Register the custom element if not already registered
      const tagName = 'components-wrapper-element';
      if (!customElements.get(tagName)) {
        customElements.define(tagName, CustomElement);
      }
      
      // Create and append the element to the app container
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = '';
        
        // Create the custom element - it will handle all routing internally
        const element = document.createElement(tagName) as any;
        
        // Append to the app container
        app.appendChild(element);
      }
    })
    .catch(error => {
      console.error('Failed to load custom element:', error);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}