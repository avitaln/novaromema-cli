# Component Performance Testing

This directory contains a Vite-based testing environment to compare React vs Lit HTML components side-by-side.

## 🚀 Quick Start

```bash
# Start the test server
npm run test:components

# Build test version (optional)
npm run test:build
```

The test server will open at `http://localhost:3001` with both components loaded side-by-side.

## 📊 Performance Testing Guide

### Memory Usage Comparison
1. Open Chrome DevTools (F12)
2. Go to **Memory** tab
3. Take heap snapshots for each component
4. Compare memory usage

### Performance Profiling
1. Go to **Performance** tab in DevTools
2. Click Record
3. Scroll through both galleries
4. Stop recording and compare results

### Network Analysis
1. Go to **Network** tab
2. Reload page
3. Compare bundle sizes and load times

### Lighthouse Audit
1. Go to **Lighthouse** tab
2. Run Performance audit
3. Compare scores

## 🏗️ Architecture

- **Vite Config**: `vite.test.config.ts` - Separate from production
- **Test Files**: `test/` directory - Isolated from main app
- **Components**: Both React and Lit versions loaded
- **Port**: 3001 (different from Wix dev server)

## ✅ Production Safety

This testing setup **does NOT affect** production builds:
- Uses separate Vite config (`vite.test.config.ts`)
- Separate output directory (`dist-test/`)
- Different port (3001 vs Wix's ports)
- Wix scripts remain unchanged
- Production build uses `wix app build` as before

## 🔧 Files Structure

```
test/
├── index.html          # Test page with both components
├── main.ts            # Component loading and setup
└── README.md          # This file

vite.test.config.ts    # Vite configuration for testing
```