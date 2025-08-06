import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CatalogAPI, type Product } from './api';
import './ProductCard'; // Import to register the custom element
import { loadedSharedStyles, loadedGalleryStyles } from './styles-loader';

@customElement('product-gallery-lit')
export class ProductGallery extends LitElement {
  static styles = [loadedSharedStyles, loadedGalleryStyles];
  
  @property()
  galleryClassName?: string;

  @state()
  private products: Product[] = [];

  @state()
  private loading = false;

  @state()
  private error: string | null = null;

  @state()
  private hasMore = true;

  @state()
  private total: number | null = null;

  @state()
  private isPending = false;

  private scrollHandler?: () => void;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadMoreProducts(true);
    this.setupScrollHandler();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeScrollHandler();
  }

  private setupScrollHandler() {
    this.scrollHandler = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        this.loadMoreProducts();
      }
    };
    window.addEventListener('scroll', this.scrollHandler);
  }

  private removeScrollHandler() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = undefined;
    }
  }

  private async loadMoreProducts(isInitial: boolean = false) {
    if (this.loading || (!this.hasMore && !isInitial)) return;

    this.loading = true;
    this.error = null;

    try {
      const offset = isInitial ? 0 : this.products.length;
      const response = await CatalogAPI.fetchProducts(offset, 25, isInitial);
      
      // Simulate transition pending state
      this.isPending = true;
      
      setTimeout(() => {
        if (isInitial) {
          this.products = response.products;
          if (response.total !== undefined) {
            this.total = response.total;
          }
        } else {
          this.products = [...this.products, ...response.products];
        }
        
        // Check if we have more products to load
        const newTotal = this.products.length;
        if (this.total && newTotal >= this.total) {
          this.hasMore = false;
        } else if (response.products.length < 25) {
          this.hasMore = false;
        }
        
        this.isPending = false;
      }, 100);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load products';
    } finally {
      this.loading = false;
    }
  }

  private handleRetry = () => {
    this.loadMoreProducts(true);
  };

  private handleLoadMore = () => {
    this.loadMoreProducts();
  };

  private renderProductCard(product: Product) {
    return html`<product-card-lit .product=${product}></product-card-lit>`;
  }

  render() {
    if (this.error && this.products.length === 0) {
      return html`
        <div class="productGallery ${this.galleryClassName || ''}">
          <div class="error">
            <p>שגיאה בטעינת המוצרים: ${this.error}</p>
            <button 
              @click=${this.handleRetry}
              class="retryButton"
            >
              נסה שוב
            </button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="productGallery ${this.galleryClassName || ''}">
        ${this.total ? html`
          <div class="totalProducts">
            מציג ${this.products.length} מתוך ${this.total} מוצרים
          </div>
        ` : ''}
        
        <div class="productGrid">
          ${this.products.map((product) => this.renderProductCard(product))}
        </div>

        ${(this.loading || this.isPending) ? html`
          <div class="loadingSpinner">
            <div class="spinner"></div>
            <p>טוען מוצרים...</p>
          </div>
        ` : ''}

        ${!this.hasMore && this.products.length > 0 ? html`
          <div class="endMessage">
            <p>הצגת כל המוצרים</p>
          </div>
        ` : ''}

        ${this.error && this.products.length > 0 ? html`
          <div class="loadMoreError">
            <p>שגיאה בטעינת מוצרים נוספים: ${this.error}</p>
            <button 
              @click=${this.handleLoadMore}
              class="retryButton"
            >
              נסה שוב
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}