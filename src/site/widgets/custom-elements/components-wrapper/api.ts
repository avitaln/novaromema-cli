export interface PartialProduct {
  id: string;
  artist: string;
  title: string;
  image: string;
  price: number;
  slug?: string;
  ribbon?: string;
  // Additional fields from your API
  posted?: string;
  shortFormat?: string;
  formats?: number[];
  specials?: any[];
  inventory?: number;
  label?: string;
  country?: string | null;
  released?: number;
  isNew?: boolean;
  isTagged?: boolean;
  createdDate?: number;
  metadata?: {
    format?: string;
    media?: string;
    sleeve?: string;
    genres?: string[];
    styles?: string[];
    comments?: string;
    trackList?: string;
    notes?: string;
    weight?: number;
  };
}

export interface FullProduct extends PartialProduct {
  // Map API fields to our expected fields
  descmain?: string;
  desctracklist?: string;
  descnotes?: string;
}

export interface CatalogResponse<TProduct> {
  products: TProduct[];
  total?: number;
}

// Switch between localhost and production
const IS_LOCAL = true; // Set to false for production
const BASE_URL = IS_LOCAL ? 'http://localhost:8080' : 'https://novaromema-public.fly.dev';

export interface ProductFilter {
  limit?: number;
  offset?: number;
  returnTotal?: boolean;
  partial?: boolean;
  sort?: 'pricelow' | 'pricehigh' | 'artist' | 'title';
  name?: string;
  artist?: string;
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  formats?: number[];
  specials?: number[];
  genres?: number[];
  isNew?: boolean;
  country?: string;
}

export class CatalogAPI {
  // Format mappings based on API guide
  static readonly FORMAT_MAPPINGS = {
    'CD': 1,
    'LP': 2,
    '10"': 3,
    '12"': 4,
    '7"': 5,
    'Cassette': 6
  } as const;

  // Special category mappings based on API guide
  static readonly SPECIAL_MAPPINGS = {
    'preorder': 1,
    'recommended': 2,
    'classics': 3,
    'new': 4,
    'rare': 5
  } as const;

  // Hebrew to English format mapping for UI
  static readonly HEBREW_FORMAT_MAPPINGS = {
    'LP': 2,
    'CD': 1,
    'Cassette': 6,
    'Digital': 1 // Assuming digital maps to CD for now
  } as const;

  // Helper function to create base64 encoded filter URL
  static createFilterUrl(filterObject: ProductFilter): string {
    const encodedFilter = btoa(JSON.stringify(filterObject));
    return `${BASE_URL}/products?filter=${encodedFilter}`;
  }

  static async fetchProducts(
    offset: number = 0, 
    limit: number = 25, 
    returnTotal: boolean = false,
    formats?: string
  ): Promise<CatalogResponse<PartialProduct>> {
    // Convert old format parameter to new filter format
    const filter: ProductFilter = {
      limit,
      offset,
      returnTotal,
      partial: true
    };

    if (formats) {
      // Convert comma-separated format string to array of numbers
      filter.formats = formats.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
    }

    const url = this.createFilterUrl(filter);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  // New method for advanced filtering with all options
  static async fetchProductsWithFilter(filter: ProductFilter): Promise<CatalogResponse<PartialProduct>> {
    const url = this.createFilterUrl(filter);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products with filter:', error);
      throw error;
    }
  }

  static async fetchHome(): Promise<Array<{ title: string; list: PartialProduct[]; buttonTitle?: string }>> {
    const url = new URL(`${BASE_URL}/home`);
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Expecting an array of sections: { title, list: [...], buttonTitle }
      return (data || []).map((section: any) => ({
        title: section.title,
        buttonTitle: section.buttonTitle,
        list: (section.list || []).map((p: any) => ({
          id: String(p.id),
          artist: p.artist,
          title: p.title,
          image: p.image,
          price: Number(p.price),
          slug: p.slug,
          ribbon: p.ribbon,
        })) as PartialProduct[],
      }));
    } catch (error) {
      console.error('Failed to fetch home:', error);
      throw error;
    }
  }

  static async fetchProductDetails(productId: string): Promise<FullProduct> {
    const url = new URL(`${BASE_URL}/products`);
    url.searchParams.set('id', productId);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // API returns { products: [...], total: number }
      // We need the first product from the array
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        
        // Map API fields to our expected format
        return {
          ...product,
          descmain: product.metadata?.comments || `<p>${product.title} by ${product.artist}</p><p>Format: ${product.metadata?.format || product.shortFormat}</p><p>Label: ${product.label}</p>`,
          desctracklist: product.metadata?.trackList,
          descnotes: product.metadata?.notes
        };
      } else {
        throw new Error(`Product with id ${productId} not found`);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      throw error;
    }
  }

  static buildImageUrl(image: string, width: number = 260, height: number = 260): string {
    if (!image || image.trim() === '') {
      return "https://static.wixstatic.com/media/614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png/v1/fill/w_466,h_466,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/missing-media.png";
    }
    
    if (image.startsWith('http')) {
      return image;
    }
    
    // Handle your API's image format (e.g., "2aaad6_bc789212dc914b9da6ae61b09d24bf45~mv2.jpeg")
    return `https://static.wixstatic.com/media/${image}/v1/fill/w_${width},h_${height},al_c,q_85,usm_0.66_1.00_0.01,enc_auto/${image}`;
  }
} 