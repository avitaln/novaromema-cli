import { css, html, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { buttonRoles } from './constants.js';

const bgadd = "/v1/fill/w_300,h_300,al_c,q_85,enc_auto/a.jpg"
const missingImage = "https://static.wixstatic.com/media/614034_103e8f4ab0ae4536a38b319d3eb437ed~mv2.png/v1/fill/w_466,h_466,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/missing-media.png"

function makeUrl(img) {
    if (img) {
      if (img.startsWith('http'))
        return img
      else {
        const parts = img.split('/');
        return `https://static.wixstatic.com/media/${parts[3]}${bgadd}`;
      }
    } else {
      return missingImage;
    }
}

const options = { root: null, threshold: 0 };

export class ProductElement extends LitElement {
    static styles = css`
      ${buttonRoles}
      .imagecontainer {
        border-radius: 2px;
      }


      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: black;
        color:white;
        border-radius: 4px;
        cursor:pointer;
      }

      .btn-price {
        font-size: 16px;
      }
      
      .btn-price-big {
        font-size: 20px;
        width: 6em;
        height: 2em;
      }

      .btn-close {
        min-width: 40px;
        min-height: 40px;
        font-size: 20px;
        margin: 20px;
        border-radius: 30px;
      }

      .main {
        position: relative;
        border: 1px solid #dddddd;
        border-radius: 4px;
        width: 260px;
        background-color: white;
        font-size: 16px;
      }

      @media (max-width: 800px) {
        .main {
          width: 180px;
        }
      }


      .mainpopup {
        direction: ltr;
        display: grid;
        width: 100%;
        grid-template-columns: 3fr 2fr;
      }

      .detailscont {
        margin: 30px;
      }
  
      .image {
        position: relative;
        object-fit: contain;
        width: 260px;
        height: 260px;
        border-radius: 2px;
      }

      .imagecont {
        display: flex;
        margin: 50px;
        justify-content: right;
        align-items: start;
      }

      .imagepopup {
        width: 75%;
        object-fit: contain;
        border-radius: 2px;
        box-shadow: 0px 0px 11px 2px rgba(0,0,0,0.4); 
      }

      @media (max-width: 800px) {
        .image {
          width: 180px;
          height: 180px;
        }

        .mainpopup {
          display: grid;
          width: 100%;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }

        .imagecont {
          display: flex;
          margin: 0px;
          justify-content: center;
          align-items: start;
        }

        .imagepopup {
          width: 100%;
        }

      }
  
      .ribbon {
        position: absolute;
        left:2px;
        top:2px;
        height:24px;
        background-color: #d7e485;
        color: black;
        border-radius: 2px;
        
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
      }
  
      .name-panel {
        text-align: left;
        height: 60px;
        font-size: 14px;
      }

      .name-panel-popup {
        display: flex;
        align-items: center;
      }
  
      .product-info {
        padding: 8px;
      }
  
      .price-panel {
        display: grid;
        grid-template-columns: 1fr 100px;
        grid-template-rows: 1fr;
        height: 30px;
      }
  
      .price-text {
        justify-self: start;
        align-self: center;
        font-size: 16px;
      }

      .price-text-big {
        justify-self: start;
        align-self: center;
        font-size: 20px;
      }

    `

    static get properties() {
      return {
        index: { type: Number },
        slider: { type: Number },
        name: { type: String },
        price: { type: String },
        img: { type: String },
        ribbon: { type: String },
        slug: { type: String },        
        descmain: { type: String },
        desctracklist: { type: String },
        descnotes: { type: String },
        popup: { type: String }
      };
    }

    constructor() {
      super();
    }

    closePopup() {
      window.history.back()
    }

    calculateRibbon() {
      if (this.ribbon)
        return html`<div class="ribbon"><p>${this.ribbon}</p></div>`
      else  
        return html`<div></div>`
    }

    onImg() {
      const evt = new CustomEvent("idselected", {
        detail: {
          index: this.index,
          slider: this.slider,
        },
      });
      this.dispatchEvent(evt);
    }

    onCart() {
      const evt = new CustomEvent("addtocart", {
        detail: {
          index: this.index,
          slider: this.slider,
        },
      });
      console.log('debugc', 'product-element', 'dispatching addtocart')
      this.dispatchEvent(evt);
    }

    onKeyUp(e, action) {
      if (e.keyCode === 32) {
        e.preventDefault();
        this.activateActionButton(action);
      }
    }

    onKeyDown(e, action) {
      if (e.keyCode === 32) {
        e.preventDefault();
      }
      else if (e.keyCode === 13) {
        e.preventDefault();
        this.activateActionButton(action);
      }
    }

    activateActionButton(action) {
      switch (action) {
        case "img":
          this.onImg()
          break;
        case "cart":
          this.onCart()
          break;
        default:
          break;
      }
    }

    
    render() {
      if (this.popup==="1")
        return this.renderPopup()
      else  
        return this.renderRegular()
    }

    renderPopup() {
      const descMainHtml = html`${unsafeHTML(this.descmain)}`
      const descTracklistHtml = this.desctracklist ? 
        html`<h3>Track List</h3>${unsafeHTML(this.desctracklist)}` : 
        html``
      const descNotesHtml = this.descnotes ? 
        html`<h3>Notes</h3>${unsafeHTML(this.descnotes)}` :
        html``

      return html`
      <div class="mainpopup">
        <div class="imagecont">
          <img class="imagepopup" src='${makeUrl(this.img)}' alt="${this.name}"/>
        </div>  
        
        <div class="detailscont">
          <div class="name-panel-popup">
            <h2>${this.name}</h2>
            <div class="btn btn-close" role="button" tabindex="0" @click="${this.closePopup}">✕</div>
          </div>
          <a class="price-text-big">${this.price}</a>
          <p>${descMainHtml}</p>
          <div role="button" class="btn btn-price-big" tabindex="0" 
              @click=${(e) => this.activateActionButton("cart")} 
              @keyup=${(e) => this.onKeyUp(e, "cart")} 
              @keydown=${(e) => this.onkeydown(e, "cart")} 
            >הוספה לסל</div>
          <p>${descTracklistHtml}</p>
          <p>${descNotesHtml}</p>
        </div>  
      </div>`

    }

    renderRegular() {
      return html`
        <div class="main">
          <div 
            role="button" 
            tabindex="0" 
            @click=${(e) => this.activateActionButton("img")}
            @keyup=${(e) => this.onKeyUp(e, "img")} 
            @keydown=${(e) => this.onKeyDown(e, "img")}
            class="imagecontainer"
          >
            <img class="image" src='${makeUrl(this.img)}' alt="${this.name}"/>
            ${this.calculateRibbon()}
          </div>
          
          <div class="product-info">
            <div class="name-panel">
              <a>${this.name}</a>
            </div>  
            <div class="price-panel">
              <a class="price-text">${this.price}</a>
              <div 
                @click=${(e) => this.activateActionButton("cart")} 
                @keyup=${(e) => this.onKeyUp(e, "cart")} 
                @keydown=${(e) => this.onKeyDown(e, "cart")} 
                role="button" 
                tabindex="0" 
                class="btn btn-price">הוספה לסל</div>
            </div>
          </div>  
        </div>`
    }

    getId() {
      if (this.slider) {
        return `${this.slider}_${this.index}`
      } else {
        return `${this.index}`
      }
    }

  
  }
