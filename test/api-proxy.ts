// Test environment API that uses Vite proxy to avoid CORS issues
export interface Product {
  id: string;
  artist: string;
  title: string;
  image: string;
  price: number;
}

export interface CatalogResponse {
  products: Product[];
  total?: number;
}

// Use proxy endpoint for development testing
const BASE_URL = '/api'; // This will be proxied to https://novaromemasync.fly.dev

export class CatalogAPI {
  static async fetchProducts(
    offset: number = 0, 
    limit: number = 25, 
    returnTotal: boolean = false
  ): Promise<CatalogResponse> {
    const url = new URL(`${BASE_URL}/catalog`, window.location.origin);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('returnTotal', returnTotal.toString());
    url.searchParams.set('partial', 'true');

    try {
      console.log('Fetching from proxy:', url.toString());
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  static buildImageUrl(image: string): string {
    return `https://static.wixstatic.com/media/${image}/v1/fill/w_260,h_260,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/${image}`;
  }
}

// For development testing, we can also provide mock data as fallback
export const mockProducts: Product[] = [
  {
    id: '1',
    artist: 'Test Artist 1',
    title: 'Test Product 1',
    image: '614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png',
    price: 100.00
  },
  {
    id: '2',
    artist: 'Test Artist 2',
    title: 'Test Product 2',
    image: '614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png',
    price: 150.00
  },
  {
    id: '3',
    artist: 'Test Artist 3',
    title: 'Test Product 3',
    image: '614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png',
    price: 200.00
  },
  {
    id: '4',
    artist: 'Test Artist 4',
    title: 'Test Product 4',
    image: '614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png',
    price: 250.00
  },
  {
    id: '5',
    artist: 'Test Artist 5',
    title: 'Test Product 5',
    image: '614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png',
    price: 300.00
  }
];

export class MockCatalogAPI {
  static async fetchProducts(
    offset: number = 0, 
    limit: number = 25, 
    returnTotal: boolean = false
  ): Promise<CatalogResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const start = offset;
    const end = Math.min(start + limit, mockProducts.length);
    const products = mockProducts.slice(start, end);
    
    return {
      products,
      total: returnTotal ? mockProducts.length : undefined
    };
  }

  static buildImageUrl(image: string): string {
    return CatalogAPI.buildImageUrl(image);
  }
}