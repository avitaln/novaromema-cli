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

const BASE_URL = 'https://novaromemasync.fly.dev';

export class CatalogAPI {
  static async fetchProducts(
    offset: number = 0, 
    limit: number = 25, 
    returnTotal: boolean = false
  ): Promise<CatalogResponse> {
    const url = new URL(`${BASE_URL}/catalog`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('returnTotal', returnTotal.toString());
    url.searchParams.set('partial', 'true');

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  static buildImageUrl(image: string): string {
    return `https://static.wixstatic.com/media/${image}/v1/fill/w_260,h_260,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/${image}`;
  }
} 