import { css, html, LitElement } from 'lit';
import {map} from 'lit/directives/map.js';
import { font_family } from './constants';

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

export class Search extends LitElement {
  static styles = css`
    .buttons {
      display: flex;
      gap: 20px;
    }
    .placeholder {
      width: 100%;
      height: 100%;
      background-color: transparent;
    }

    .hidden {
      display: none;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6); /* semi-transparent background */
        display: none; /* hidden by default */
        z-index: 10; /* above everything else */
    }

    dialog {
      z-index: 20;
    }

    .mybtn {
      background-color: black;
      color: white;
      font-family: ${font_family};
      width: 250px;
      height: 60px;
      border-radius: 60px;
      font-size: 18px;
      border: none;
    }

    @media (max-width: 800px) {
      .mybtn {
        width: 120px;
        height: 40px;
        border-radius: 40px;
        font-size: 14px;
      }
    }

    .closebtn {
      border: none;
      cursor: default;
      padding-top: 4px;
      height: auto;
      width: 50px;
      stroke: black;
      outline: none;
      align-self: center;
      font-size: 30px;
      font-weight: 100;
      font-family: Arial, Helvetica, sans-serif;
      text-align: center;
    }

    .closebtn:hover {
      font-weight: 700;
    }

    @media (max-width: 800px) {
      .closebtn {
        padding-top: 0px;
        height: 30px;
        width: 30px;
        font-size: 24px;
      }
    }

    .closebtn:hover {
      stroke-width: 2px;
    }

    .mytable {
      direction:ltr; 
      width: 100%;
    }
    
    .myrow {
      background-color: rgb(240,240,240)
    }

    .myrow:hover {
      background-color: rgb(200,200,200)
    }

    .tdimg {
      width: 50px;
    }
    @media (max-width: 800px) {
      .tdimg {
        width: 40px;
      }
    }

    .tdtext {
      padding-left: 20px;
      font-size: 18px;
      cursor: pointer;
    }
    @media (max-width: 800px) {
      .tdtext {
        padding-left: 10px;
        font-size: 14px;
      }
    }

    .searchcont {
      direction: rtl;
      width: 800px;
      height: 600px;
      background-color: rgba(220,220,220,.8);
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;
      padding: 20px;
      gap: 20px;
      font-family: ${font_family};
    }

    @media (max-width: 800px) {
      .searchcont {
        width: 360px;
        height: 500px;
        padding: 10px;
        gap: 10px;
      }
    }


    .inputcont {
      display: grid;
      grid-template-columns: 1fr 50px;
      grid-template-rows: 50px;
      grid-gap: 4px;
      width: 100%;
    }

    @media (max-width: 800px) {
      .inputcont {
        grid-template-columns: 1fr 30px;
        grid-template-rows: 30px;
        grid-gap: 2px;
      }
    }

    .image {
      width: 100%;
      height: 100%;
    }

    .imagecont {
      width: 50px;
      height: 50px;
    }

    @media (max-width: 800px) {
      .imagecont {
        width: 40px;
        height: 40px;
      }
    }

    .mydialog {
      border: 2px solid darkgray;
      border-radius: 4px;
      padding: 0;
      background-color: rgba(240,240,240,.4);
    }

    .search {
      height: 50px;
      border: 1px solid lightgray;
      padding-right: 20px;
      outline: none;
      width: auto;
      font-size: 18px;
      border-radius: 6px;
      align-self: center;

    }

    @media (max-width: 800px) {
      .search {
        height: 30px;
        padding-right: 10px;
        font-size: 16px;
        border-radius: 4px;
      }
    }

    .record {
      align-self: center;
      height: 40px;
      width: 40px;
    }

    @media (max-width: 800px) {
      .record {
        align-self: center;
        height: 28px;
        width: 28px;
      }
    }

  `

  static get properties() {
    return {
      inprogress: { type: String },
      value: { type: String },
      items: { type: Array, attribute: false },
      subTotal: { type: String, attribute: false },
      setitems: { type: Object },
      cartmsg: { type: Object },
      opensearch: { type: String },
    };
  }

  constructor() {
    super();
    this.value = '';
  }

  get setitems() { return undefined; }

  set setitems(setitemsValue) {
    this.items = setitemsValue.items;
    this.requestUpdate();
  }

  get opensearch() { return undefined; }

  set opensearch(o) {
    this.onOpenDialog()
  }

  get cartmsg() { return undefined; }

  set cartmsg(cartObj) {
    this.onOpenDialog()
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
        const dialog = this.shadowRoot.getElementById('mydialog');
        const overlay = this.shadowRoot.getElementById('overlay');
    
        dialog.addEventListener('cancel', () => {
          overlay.style.display = 'none';
        });
      
        dialog.addEventListener('close', () => {
          overlay.style.display = 'none';
      });
    }, 100)
  }


  handleKeyPress() {
    if(this.globalTimeout) 
       clearTimeout(this.globalTimeout);  
    this.globalTimeout = setTimeout(() => this.doSearch(), 1000)
  }

  doSearch(){  
    this.globalTimeout = undefined;  
    const element = this.shadowRoot.getElementById("search")
    this.value = element.value.trim()
    console.log('debugc',`search ${element.value}`)
    this.setitems = []
    if (this.value) {
      this.dispatchEvent(new CustomEvent('dosearch', { detail: { value: this.value } }));
    }
  }

  doClose() {
    this.shadowRoot.getElementById("mydialog").close();
    this.setitems = [];
    this.value = "";
    const element = this.shadowRoot.getElementById("search");
    element.value = "";
    // this.shadowRoot.getElementById("overlay").style.display = 'none';
  }

  onAllRes(e) {
    const savedValue = this.value;
    this.doClose();
    this.dispatchEvent(new CustomEvent('allres', { detail: savedValue }));

  }

  onRowClick(index) {
    this.dispatchEvent(new CustomEvent('goto', { detail: this.items[index] }));
  }

  onOpenDialog() {
    console.log('debugc',1)
    this.shadowRoot.getElementById("mydialog").showModal()
    console.log('debugc',2)
    this.shadowRoot.getElementById("overlay").style.display = 'block';
    console.log('debugc',3)
    this.shadowRoot.getElementById("search").focus();
    console.log('debugc',4)
  }

  render() {
    const hidden1 = this.items ? "": "hidden";
    const hidden2 = (this.items && this.items.length > 7) ? "" : "hidden";
    const hidden3 = this.inprogress ? "" : "hidden";

    return html`
      <div class="placeholder"></div>
      <div class="overlay" id="overlay"></div>
      <dialog class="mydialog" id="mydialog">
        <div class="searchcont">
          <div class="inputcont">
            <input id="search" value="${this.value}" placeholder="חיפוש בכל האתר" class="search" @keyup="${(e) => this.handleKeyPress()}" >
            <spinning-record class="${hidden3} record"></spinning-record>
            
          </div>
          <table class="mytable ${hidden1}" cellspacing="4" cellpadding="0">
            ${map(this.items, (item, index) => { 
              return html`<tr class="myrow" @click="${(e) => this.onRowClick(index)}">
              <td class="tdimg"><div class="imagecont"><img class="image" src="${makeUrl(item.mainMedia)}"/></div></td>
              <td class="tdtext">${item.name} - ${item.formattedDiscountedPrice}</td>
              </tr>`
            })}
          </table>
          <div class="buttons">
            <button class="mybtn ${hidden2}" @click="${(e) => this.onAllRes(e)}">לכל התוצאות</button>
            <button class="mybtn" @click="${(e) => this.doClose(e)}">סגירה</button>
          </div>
        </div>
      </dialog>
    `
  }
}

