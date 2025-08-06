import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CatalogAPI, type Product } from './api';
import { sharedStyles, cardStyles } from './shared-styles';

const FALLBACK_IMAGE = "https://static.wixstatic.com/media/614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png/v1/fill/w_260,h_260,al_c,q_85,enc_auto/a.jpg";

@customElement('product-card-lit')
export class ProductCard extends LitElement {
  static styles = [sharedStyles, cardStyles];

  @property({ type: Object })
  product!: Product;

  @state()
  private imageError = false;

  private get imageUrl() {
    if (!this.product?.image || this.product.image.trim() === '' || this.imageError) {
      return FALLBACK_IMAGE;
    }
    return CatalogAPI.buildImageUrl(this.product.image);
  }

  private handleImageError = () => {
    this.imageError = true;
  };

  private handleAddToCart = () => {
    console.log('Adding to cart:', this.product);
  };

  render() {
    if (!this.product) {
      return html``;
    }

    return html`
      <div class="productCard">
        <div class="productImage">
          <img 
            src=${this.imageUrl} 
            alt="${this.product.artist} - ${this.product.title}"
            loading="lazy"
            @error=${this.handleImageError}
          />
        </div>
        <div class="productInfo">
          <h3 class="productArtist">${this.product.artist}</h3>
          <p class="productTitle">${this.product.title}</p>
          <div class="productPrice">₪ ${this.product.price.toFixed(2)}</div>
          <button class="addToCartButton" @click=${this.handleAddToCart}>
            הוסף לסל
          </button>
        </div>
      </div>
    `;
  }
}