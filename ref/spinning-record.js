import { device } from './constants';

const recordSize = device === 'm' ? '30' : '50'; 

export class SpinningRecord extends HTMLElement {

    constructor() {
      super()
    }
  
    connectedCallback() {
      const mainDiv = document.createElement('div')
      mainDiv.innerHTML = `
      <div>
      <style>
          #something_moving {
              width: 100%;
              height: 100%;
              margin: auto;
          }
  
          #something_moving img {
              width: 100%;
              position: relative;
              animation-name: spin;
              animation-duration: 2s;
              animation-iteration-count: infinite;
              animation-delay: 0s;
          }
  
          @keyframes spin {
              0%   {  rotate: 0deg;  }
              5%   {  rotate: 18deg;  }
              10%  {  rotate: 36deg;  }
              15%  {  rotate: 54deg;  }
              20%  {  rotate: 72deg;  }
              25%  {  rotate: 90deg;  }
              30%  {  rotate: 108deg;  }
              35%  {  rotate: 126deg;  }
              40%  {  rotate: 144deg;  }
              45%  {  rotate: 162deg;  }
              50%  {  rotate: 180deg;  }
              55%  {  rotate: 198deg;  }
              60%  {  rotate: 216deg;  }
              65%  {  rotate: 234deg;  }
              70%  {  rotate: 252deg;  }
              75%  {  rotate: 270deg;  }
              80%  {  rotate: 288deg;  }
              85%  {  rotate: 306deg;  }
              90%  {  rotate: 324deg;  }
              95%  {  rotate: 342deg;  }
              100% {  rotate: 360deg;  }
          }
      </style>
      <div id="something_moving">
          <img src="https://static.wixstatic.com/media/b1ae3f_32ea76b6fd27422388c547d557e4c3ac~mv2.png">
      </div>
      </div>
      `
  
      this.appendChild(mainDiv)
    }
  }
  