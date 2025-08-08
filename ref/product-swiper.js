import { css, html, LitElement } from 'lit';
import {map} from 'lit/directives/map.js';
import { font_family, buttonRoles } from './constants';

export class ProductSwiper extends LitElement {

    static styles = css`
      ${buttonRoles}

      swiper-container {
        direction: rtl;
      }

      .cont {
        font-family: ${font_family};
        font-size: 16px;
      }
  
      .swipercont {
        max-width: 1800px;
        margin: auto;
        padding-left: 80px;
        padding-right: 80px;
        width: 100%-160px;
        margin-top: 30px;
        font-family: ${font_family};
      }


      @media (max-width: 800px) {
        .swipercont {
          width: 100%-20px;
          padding-left: 10px;
          padding-right: 10px;
        }
      }
  
      swiper-container::part(button-prev), swiper-container::part(button-next) {
        background-color: rgba(255, 255, 255, .6);
        border: 1px solid darkgrey;
        padding: 10px;
        border-radius: 30px;
        width: 30px;
        height: 30px;
      }

      @media (max-width: 800px) {
        swiper-container::part(button-prev), swiper-container::part(button-next) {
          background-color: rgba(255, 255, 255, 0);
          border: none;
        }
      }
  
      .slide {
        display: flex;
        max-width: 280px;
        margin-left: 10px;
        margin-right: 10px;
      }
  
      @media (max-width: 800px) {
        .slide {
          max-width: 190px;
          margin-left: 5px;
          margin-right: 5px;
        }
      }
  
      .title {
        color: black;
        font-size: 36px;
        letter-spacing: 4px;
        text-align: center;
        padding: 8px;
        border: 30px solid transparent;
      }

      @media (max-width: 800px) {
        .title {
          padding: 2px;
          border: 10px solid transparent;        
          letter-spacing: 2px;
          font-size: 24px;
        }
      }

      .btn-more {
        border-radius: 20px;
        padding: 0.5em 1em;
        font-size: 18px;
        letter-spacing: 3px;
      }

      .btn-more:focus:before {
        border-radius: 26px;
      }

      @media (max-width: 800px) {
        .btn-more {
          font-size: 14px;
          letter-spacing: 2px;
        }
      }

      .button-container {
        padding: 2em 0em;
        display: flex;
        justify-content: center;
      }

      .divider {
        border-top: 2px solid lightgray
      }
    `
  
    static get properties() {
      return {
        data: { type: Array, attribute: false },
        setdata: { type: Array, hasChanged(newVal, oldVal) { return true; } }, // [{ items, title, btntitle, lnk }]
        selectedSliderAndIndex: { type: Object, attribute: false },
        closepopup: { type: String, hasChanged(newVal, oldVal) { return true; } },
      };
    }

    get setdata() { return undefined }
    get closepopup() { return undefined }

    set setdata(value) {
      this.t0 = Date.now();
      this.data = value
      this.requestUpdate()
    }

    set closepopup(value) {
      this.selectedSliderAndIndex = undefined
      this.requestUpdate()
    }

    render() {
      if (this.selectedSliderAndIndex)
        return this.renderPopup()
      else
        return this.renderAllSwipers()
    }

    idSelected(e) {
      if (Date.now()-this.t0 < 4000) {
        e.preventDefault();
        console.log('debugc', 'idselected', 'notready')
        return;
      }
      this.sp = window.scrollY // save scroll position
      this.selectedSliderAndIndex = e.detail
      const selectedItem = this.getSelectedItem()
      window.history.pushState({ productPage: selectedItem.slug }, '', `/product-page/${selectedItem.slug}`)
      this.dispatchEvent(new CustomEvent('open-popup'));
    }

    getSelectedItem() {
      if (this.selectedSliderAndIndex) {
        return this.data[this.selectedSliderAndIndex.slider].items[this.selectedSliderAndIndex.index]
      } else {
        return undefined
      }
    }

    addToCart(e) {
      console.log('debugc', 'product-swiper', 'got addtocart. dispatching add-to-cart', e.detail)
      const clicked = this.data[e.detail.slider].items[e.detail.index];
      this.dispatchEvent(new CustomEvent('add-to-cart', { detail: { pid: clicked._id }}));
    }

    renderSwiper(sliderData, sliderIndex) {
      return html`
      <div class="swipercont">
        <div class="title">• ${sliderData.title} •</div>
        <swiper-container 
          class="swiper-container" 
          space-between="0" 
          slides-per-view="auto" 
          navigation
          >

          ${map(sliderData.items, (item, index) => { 
              return html`
              <swiper-slide class="slide">
              <product-element 
              index=${index}
              slider=${sliderIndex}
              name="${item.name}"
              price="${item.formattedDiscountedPrice}"
              img="${item.mainMedia}"
              ribbon="${item.ribbon}"
              slug="${item.slug}"
              @idselected="${(e) => { this.idSelected(e) }}"
              @addtocart="${(e) => { this.addToCart(e) }}"
              ></product-element>
              </swiper-slide>
              `
          })}
  
        </swiper-container>

        
        <div class="button-container">
          <div 
          lnk="/${sliderData.page}?${sliderData.lnk}"
          tabindex="0" 
          role="button" 
          class="btn-more"
          @click=${(e) => this.onButtonClick(e, "all")} 
          @keyup=${(e) => this.onKeyUp(e, "all")} 
          @keydown=${(e) => this.onKeyDown(e, "all")} 
          >${sliderData.btntitle}
        </div>

        <!-- <hr class="divider"> -->
      </div>
      `
    }
  
    renderAllSwipers() {
      return html`
      <div class="cont">
        ${map(this.data, (sliderData, sliderIndex) => {
          return this.renderSwiper(sliderData, sliderIndex)
        })}
      </div>
      `;
    }

    renderPopup() {
      const selectedItem = this.getSelectedItem()
      return html`
      <div class="cont">
        <product-element
          index="${this.selectedSliderAndIndex.index}"
          slider="${this.selectedSliderAndIndex.slider}"
          name="${selectedItem.name}" 
          img="${selectedItem.mainMedia}"
          price="${selectedItem.formattedDiscountedPrice}"
          descmain="${selectedItem.description}"
          desctracklist="${this.getTracklist()}"
          descnotes="${this.getNotes()}"
          @addtocart="${(e) => { this.addToCart(e) }}"
          popup="1"
        >
        </product-element>
      </div>
      `
    }

    getTracklist() {
      return this.getSelectedItem()?.additionalInfoSections?.find(el => el.title === "Tracklist")?.description||""
    }

    getNotes() {
      return this.getSelectedItem()?.additionalInfoSections?.find(el => el.title === "Notes")?.description||""
    }

    updated(changedProperties) {
      changedProperties.forEach((oldValue, propName) => {
        if (propName === 'selectedSliderAndIndex') {
          let newScrollPos = 0
          if (!this.selectedSliderAndIndex && this.sp) {
            newScrollPos = this.sp
            this.sp = undefined
          }
          setTimeout(() => {
            window.scrollTo(0, newScrollPos)
          }, 1);
        }
      });
    }

    onButtonClick(e, action) {
      this.activateActionButton(e, action);
    }

    onKeyUp(e, action) {
      if (e.keyCode === 32) {
        e.preventDefault();
        this.activateActionButton(e, action);
      }
    }

    onKeyDown(e, action) {
      if (e.keyCode === 32) {
        e.preventDefault();
      }
      else if (e.keyCode === 13) {
        e.preventDefault();
        this.activateActionButton(e, action);
      }
    }

    activateActionButton(e, action) {
      switch (action) {
        case "all":
          window.location.href = e.target.getAttribute("lnk");
          break;
        default:
          break;
      }
      const evt = new CustomEvent("idselected", {
        detail: {
          index: this.index,
          slider: this.slider,
        },
      });
      this.dispatchEvent(evt);
    }
  }
  