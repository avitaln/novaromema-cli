import { css, html, LitElement } from 'lit';
import {map} from 'lit/directives/map.js';
import { tags } from './constants';

export class SelectionTags extends LitElement {

    static styles = css`
      .wrap {
        position: relative;
        display: inline-block;
      }

      .ddlbl {
        display: inline-block;
        cursor: pointer;
        background-color: black;
        color: white;
        padding: 4px 8px;
        border-radius: 4px 0px 0px 4px;
        font-size: 16px;
      }

      .lblnondefault {
        background-color: rgb(207, 45, 32);
      }

      .dd {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      .cont {
        direction: rtl;
        font-size: 16px;
        background-color:rgb(230,230,230);
        border-radius: 4px;
      }
    
      .label {
        font-size: 14px;
        padding: 1px 8px;
        color: black;
      }

      @media (max-width: 800px) {
        .label {
          font-size: 12px;
          padding: 1px 4px;
          color: black;
        }
        .ddlbl {
          padding: 4px 7px;
          font-size: 13px;
        }

      }
    `
  
    static get properties() {
      return {
        tagkey: { type: String },
        selected: { type: String },
        label: { type: String },
        mode: { type: String },
      };
    }

    constructor() {
      super();
      this.mode = ""
    }

    onChange(e) {
      this.selected = e.target.value;
      this.dispatchEvent(new CustomEvent('value-change', { detail: { value: this.selected, tagkey: this.tagkey } }));
    }

    isDefault() {
      return this.selected === 'all' || (this.selected === 'new' && this.tagkey === 'sort');
    }
  
    render() {
      const tagsobj = tags[this.tagkey+this.mode]
      const nondefault = this.isDefault() ? "" : "lblnondefault"
      return html`
        <div class = "cont">
          <label class="label">${tagsobj.title}</label>
          <div class="wrap">
            <label  class="ddlbl ${nondefault}">${this.label}</label>
            <select class="dd" @change="${this.onChange}">
              ${map(tagsobj.list, (tag, index) => { 
                return html`<option value="${tag.value}" ?selected=${tag.value === this.selected}>${tag.label}</option>`
              })}
            </select>
          </div>

        </div> 
      `
    }

    updated(changedProperties) {
      changedProperties.forEach((oldValue, propName) => {
        if (propName === 'selected') {
          this.label = tags[this.tagkey+this.mode].list.find(el => el.value === this.selected).label
        }
      });
    }
  }
