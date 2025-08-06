# Performance Testing Guide: React vs Lit Components

## Browser DevTools Performance Analysis

### 1. Chrome DevTools Performance Tab
1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click **Record** button
4. Navigate to each page and interact (scroll, load more products)
5. Stop recording after ~10 seconds
6. Compare metrics:
   - **Scripting time** (JavaScript execution)
   - **Rendering time** (DOM updates)
   - **Painting time** (visual updates)
   - **Loading time** (resource loading)

### 2. Lighthouse Performance Audit
1. Open DevTools → **Lighthouse** tab
2. Select **Performance** category
3. Run audit on both pages
4. Compare scores:
   - **First Contentful Paint (FCP)**
   - **Largest Contentful Paint (LCP)**
   - **Total Blocking Time (TBT)**
   - **Cumulative Layout Shift (CLS)**

### 3. Memory Usage Analysis
1. DevTools → **Memory** tab
2. Take heap snapshots on both pages
3. Compare:
   - **Total heap size**
   - **Used heap size**
   - **Number of DOM nodes**
   - **Event listeners count**

## Network Performance

### 4. Network Tab Analysis
1. DevTools → **Network** tab
2. Reload each page
3. Compare:
   - **Total bundle size**
   - **JavaScript bundle size**
   - **Load time**
   - **Number of requests**

## Runtime Performance Metrics

### 5. JavaScript Bundle Analysis
```bash
# If using webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
# Add to build process to analyze bundle sizes
```

### 6. Custom Performance Measurements
Add to both components:

```javascript
// Measure component mount time
const startTime = performance.now();
// ... component initialization
const endTime = performance.now();
console.log(`Component mount time: ${endTime - startTime}ms`);

// Measure scroll performance
let scrollCount = 0;
window.addEventListener('scroll', () => {
  const start = performance.now();
  // Scroll handling logic
  const end = performance.now();
  console.log(`Scroll handler ${++scrollCount}: ${end - start}ms`);
});
```

## Real User Monitoring (RUM)

### 7. Core Web Vitals
Use browser APIs to measure:

```javascript
// Largest Contentful Paint
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.startTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });

// First Input Delay
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime);
  }
}).observe({ entryTypes: ['first-input'] });

// Cumulative Layout Shift
let clsValue = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  }
  console.log('CLS:', clsValue);
}).observe({ entryTypes: ['layout-shift'] });
```

## Load Testing

### 8. Automated Performance Testing
```javascript
// Using Puppeteer for automated testing
const puppeteer = require('puppeteer');

async function measurePagePerformance(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  const metrics = await page.metrics();
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  
  console.log('Metrics:', metrics);
  console.log('Load time:', performanceTiming.loadEventEnd - performanceTiming.navigationStart);
  
  await browser.close();
}
```

## Key Metrics to Compare

### Initial Load Performance
- [ ] Bundle size (KB)
- [ ] Parse/compile time (ms)
- [ ] Time to first paint (ms)
- [ ] Time to interactive (ms)

### Runtime Performance
- [ ] Memory usage (MB)
- [ ] Scroll performance (FPS)
- [ ] Product loading time (ms)
- [ ] DOM node count

### User Experience
- [ ] Lighthouse Performance Score
- [ ] First Contentful Paint
- [ ] Largest Contentful Paint
- [ ] Total Blocking Time
- [ ] Cumulative Layout Shift

## Expected Results

### Lit Advantages
- **Smaller bundle size** (no React overhead)
- **Faster initial load** (less JavaScript to parse)
- **Better memory efficiency** (no virtual DOM)
- **Smoother animations** (direct DOM manipulation)

### React Advantages
- **More mature ecosystem** (better debugging tools)
- **Potentially better development experience**

## Testing Scenarios

1. **Cold load** - First visit to each page
2. **Warm load** - Subsequent visits (cached resources)
3. **Heavy interaction** - Rapid scrolling, multiple product loads
4. **Mobile performance** - Test on slower devices
5. **Network throttling** - Test on slow 3G connections