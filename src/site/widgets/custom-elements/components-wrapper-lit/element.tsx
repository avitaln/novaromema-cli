import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { APP_NAME, WIDGET_VERSION } from '../../constants';
import './ProductGallery'; // Import to register the custom element
import { sharedStyles, rootStyles } from './shared-styles';

class ComponentsWrapperLit extends LitElement {
  static styles = [sharedStyles, rootStyles];
  @property()
  displayName?: string;

  @property()
  height?: string; // Height constraint for the gallery

  @property()
  responsive?: string; // "true" to enable responsive height

  @property()
  fillScreen?: string; // "false" to disable fill screen (enabled by default)

  render() {
    return html`
      <div 
        class="root" 
        data-fill-screen="true"
      >
        <h2>${APP_NAME} version: ${WIDGET_VERSION}</h2>
        <product-gallery-lit></product-gallery-lit>
      </div>
    `;
  }
}

export default ComponentsWrapperLit as CustomElementConstructor;