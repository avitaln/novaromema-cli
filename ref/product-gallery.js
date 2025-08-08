import { css, html, LitElement } from 'lit';
import { map } from 'lit/directives/map.js';
import { font_family, device, PAGESIZE } from './constants';

export class ProductGallery extends LitElement {

    static styles = css`
      .cont {
        direction: rtl;
        font-family: ${font_family};
        font-size: 16px;
      }

      .break {
        flex-basis: 100%;
        height: 0px;
      }

      .onlymobile {
        display: none;
      }

      .onlydesktop {
        display: none;
      }

      @media (min-width: 800px) {
        .onlydesktop {
          display: block;
        }
      }

      @media (max-width: 800px) {
        .onlymobile {
          display: block;
        }
      }

      .selwrap {
        padding: 10px 5px 10px 5px;
        width: max-content;
      }

      @media (max-width: 800px) {
        .selwrap {
          padding: 6px 3px 6px 3px;
        }
      }

      @media (min-width: 801px) {
        .results-cont {
          align-content: center;
        }
      }

      @media (max-width: 800px) {
        .results-cont {
          height: 25px;
        }
      }

      .label {
        font-size: 18px;
      }

      @media (max-width: 800px) {
        .label {
          font-size: 16px;
        }
      }

      .fcontout {
        direction: rtl;
        position: fixed;
        z-index: 1;
        display: flex;
        width: 100%;
        justify-content: center;
        background-color: rgb(190,190,190);
      }

      .fcontin {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        height: auto;
      }

      .bottomcont {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        height: auto;
        padding: 20px;
      }

      @media (max-width: 800px) {
        .fcontin {
          flex-wrap: wrap;
        }
      }

      .search {
        height: 30px;
        border: 1px solid lightgray;
        border-radius: 4px;
        padding-right: 10px;
        outline: none;
      }

      .searchd {
        width: 200px;
        font-size: 16px;
      }

      .searchm {
        width: 200px;
        font-size: 16px;
      }
  
      .cont-gallery {
        max-width: 1600px;
        direction: rtl;
        display: grid;
        grid-template-columns: repeat(auto-fill,260px);
        justify-content: center; 
        gap: 40px;
        padding-bottom: 40px;
        margin: auto;
      }

      .cont-gallery-top {
        padding-top: 80px;
      }

      @media (max-width: 800px) {
        .cont-gallery {
          display: grid;
          justify-items: right;
          gap: 10px;
          padding-bottom: 10px;
          padding-left: 10px;
          padding-right: 10px;
          grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
        }

        .cont-gallery-top {
          padding-top: 140px;
        }

      }
      .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: black;
          color:white;
          border-radius: 4px;
          cursor:pointer;
          font-size: 20px;
          width: 8em;
          height: 2em;
          letter-spacing: 4px;
      }

      .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          color:#C70039;
          cursor:pointer;
          font-size: 20px;
          width: 8em;
          height: 2em;
          letter-spacing: 4px;
      }
  
    `
  
    static get properties() {
      return {
        mode: { type: String }, // if empty=ALL / cd / vinyl
        items: { type: Array, attribute: false },
        currentPage: { type: Number, attribute: false },
        selectedItemIndex: { type: Number, attribute: false },
        status: { type: Object }, 
        total: { type: String, attribute: false },
        loading: { type: Boolean, attribute: false },
        stopLoading: { type: Boolean, attribute: false },
        additems: { type: Array, hasChanged(newVal, oldVal) { return true; } },
        setitems: { type: Object, hasChanged(newVal, oldVal) { return true; } }, // { total, items }
        closepopup: { type: String, hasChanged(newVal, oldVal) { return true; } },
      };
    }

    _handleScroll() {
      if (window.innerHeight + window.scrollY > this.getBoundingClientRect().height - 500 && this.items.length < 500 && !this.stopLoading) {
        const self = this;
        this.loading = true;
        if (Date.now()-this.t0 < 4000) {
          setTimeout(() => { self.loadMore(); }, 3000);
        } else {
          this.loadMore();
        }
      }

    }

    connectedCallback() {
      super.connectedCallback();
      window.addEventListener('scroll', this._boundHandleScroll);
      this.t0 = Date.now();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this._boundHandleScroll);
      super.connectedCallback();
    }

    constructor() {
      super();
      this.status = {
        "genre": "all",
        "special": "all",
        "condition": "all",
        "format": "all",
        "sort": "new",
        "search": ""
      }
      this.mode = 'all'
      this.currentPage = 0;

      this.visibleItems = [];
  
      this._boundHandleScroll = this._handleScroll.bind(this);
      this.loading = false;
      this.stopLoading = false;
    }
  
    get additems() { return undefined }
    get setitems() { return undefined }
    get closepopup() { return undefined }
  
    set additems(newItems) {
      this.loading = false
      if (newItems.length > 0) {
        this.items.push.apply(this.items, newItems);
        this.requestUpdate();
      } else {
        this.stopLoading = true;
      }
    }
  
    set setitems(value) {
      this.loading = false
      this.stopLoading = false;
      this.items = value.items;
      this.currentPage = 0
      this.total = value.total;
      this.requestUpdate();
    }

    set closepopup(value) {
      this.selectedItemIndex = undefined;
      this.requestUpdate();
    }
    
    render() {
      if (this.selectedItemIndex !== undefined)
        return this.renderPopup();
      else
        return this.renderGallery();
    }

    idSelected(e) {
      this.dispatchEvent(new CustomEvent('id-selected', { detail: e.detail }));
      this.sp = window.scrollY; // save scroll position
      this.selectedItemIndex = e.detail.index;
      window.history.pushState({ productPage: e.detail.slug }, '', `/product-page/${this.items[this.selectedItemIndex].slug}`);
    }
    addToCart(e) {
      console.log('debugc', 'product-gallery', 'got addtocart. dispatching add-to-cart')
      this.dispatchEvent(new CustomEvent('add-to-cart', { detail: { pid: this.items[e.detail.index]._id }}));
    }

    handleKeyPress(id) {
      if(this.globalTimeout) 
		 	  clearTimeout(this.globalTimeout);  
		  this.globalTimeout = setTimeout(() => this.doSearch(id), 1000)
    }

    doSearch(id){  
      this.globalTimeout = undefined;  
      const element = this.shadowRoot.getElementById(id)
      this.status.search = element.value
      this.dispatchEvent(new CustomEvent('dosearch', { detail: { value: element.value.trim() } }));
    }
    
    onSelectedChanged(e) {
      window.scrollTo(0,0)
      this.status[e.detail.tagkey] = e.detail.value
      this.dispatchEvent(new CustomEvent('status-change', { detail: e.detail }));
    }

    getItemType() {
      switch (this.mode) {
        case 'cd': return 'דיסקים'
        case 'vinyl': return 'תקליטים'
      }
      return 'כותרים'
    }

    renderGallery() {
      if (this.items) {
        return html`
        <div id="cont" class="cont">
          <div class="fcontout">
            <div class="fcontin">
              <div class="selwrap"><div class="results-cont"><label class="label">מציג ${this.total} ${this.getItemType()}</label></div></div>
              <div class="selwrap onlymobile"><input id="search1" value="${this.status.search}" placeholder="חיפוש בתוצאות" class="search searchm" @keyup=${(e) => this.handleKeyPress("search1")} /></div>
              <div class="break onlymobile"></div>
              <div class="selwrap"><selection-tags @value-change="${this.onSelectedChanged}" tagkey="format" mode="${this.mode}" selected="${this.status.format}"></selection-tags></div>
              <div class="selwrap"><selection-tags @value-change="${this.onSelectedChanged}" tagkey="genre" selected="${this.status.genre}"></selection-tags></div>
              <div class="selwrap"><selection-tags @value-change="${this.onSelectedChanged}" tagkey="condition" selected="${this.status.condition}"></selection-tags></div>
              <div class="break onlymobile"></div>
              <div class="selwrap"><selection-tags @value-change="${this.onSelectedChanged}" tagkey="special" selected="${this.status.special}"></selection-tags></div>
              <div class="selwrap"><selection-tags @value-change="${this.onSelectedChanged}" tagkey="sort" selected="${this.status.sort}"></selection-tags></div>
              <div class="selwrap onlydesktop"><input id="search2" value="${this.status.search}" placeholder="חיפוש בתוצאות" class="search searchd" @keyup=${(e) => this.handleKeyPress("search2")} /></div>
            </div>  
          </div>  
    
          <div class="cont-gallery cont-gallery-top">
            ${map(this.items, (item, index) => { 
              return html`<product-element 
              index=${index}
              name="${item.name}"
              price="${item.formattedDiscountedPrice}"
              img="${item.mainMedia}"
              ribbon="${item.ribbon}"
              slug="${item.slug}"
              @idselected="${(e) => { 
              this.idSelected(e) 
              }}"
              @addtocart="${(e) => { this.addToCart(e) }}"
              ></product-element>`
            })}
          </div>
          <div class ="bottomcont">
            ${this.renderNextButton()}
            ${this.renderLoading()}
          </div>  
          </div>
        `
      } else return html`<div></div>`
    }

    renderPopup() {
      const selectedItem = this.items[this.selectedItemIndex]
      return html`
      <div class="cont">
        <product-element
          index=${this.selectedItemIndex}
          name="${selectedItem.name}" 
          img="${selectedItem.mainMedia}"
          price="${selectedItem.formattedDiscountedPrice}"
          descmain="${selectedItem.description}"
          desctracklist="${this.getTracklist()}"
          descnotes="${this.getNotes()}"
          popup="1"
          @addtocart="${(e) => { this.addToCart(e) }}"
        >
        </product-element>
      </div>
      <button></button>
      `
    }

    renderNextButton() {
      if (this.items.length == PAGESIZE && !this.stopLoading)
        return html`
          <div role="button" class="btn" tabindex="0" @click=${(e) => this.nextPage()}>לדף ${this.currentPage + 2} &gt;</div>
        `
      else 
        return html``  
    }

    renderLoading() {
      if (this.loading)
        return html`
          <div class="loading">טוען ...</div>
        `
      else 
        return html``  
    }

    nextPage() {
      this.items = [];
      this.currentPage = this.currentPage + 1;
      window.scrollTo(0, 0);
      this.loading = true;
      this.loadMore();
    }

    loadMore() {
      this.dispatchEvent(new CustomEvent('load-more'));
    }

    getTracklist() {
      if (this.selectedItemIndex !== undefined)
        return this.items[this.selectedItemIndex]?.additionalInfoSections?.find(el => el.title === "Tracklist")?.description||""
      else
        return ""
    }

    getNotes() {
      if (this.selectedItemIndex !== undefined)
        return this.items[this.selectedItemIndex]?.additionalInfoSections?.find(el => el.title === "Notes")?.description||""
      else 
        return ""
    }

    updated(changedProperties) {
      changedProperties.forEach((oldValue, propName) => {
        if (propName === 'selectedItemIndex') {
          let newScrollPos = 0
          if (this.selectedItemIndex === undefined && this.sp) {
            newScrollPos = this.sp
            this.sp = undefined
          }
          setTimeout(() => {
            window.scrollTo(0, newScrollPos)
          }, 1);
        }
      });
    }
  }
  