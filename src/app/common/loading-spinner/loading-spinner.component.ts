import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
  @if(visible){
    <div class="loader-overlay d-flex justify-content-center align-items-center">
    <div class="loader">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none"></circle>
        </svg>
      </div>
    </div>
  }
    
  `,
  styles: [`
    .loader-overlay {
      position: fixed; /* Or absolute, depending on context */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.1); /* Semi-transparent background */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000; /* Ensure it's on top */
    }

    .loader {
      width: 60px;
      height: 60px;
      position: relative;
    }

    .circular {
      animation: rotate 2s linear infinite;
      height: 100%;
      width: 100%;
    }

    .path {
      stroke-dasharray: 150;
      stroke-dashoffset: -40;
      stroke-width: 4;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite; /* Combined animations */
    }
    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes dash {
      0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124;
      }
    }

    @keyframes color {  /* New color animation */
      0% {
        stroke: #4285f4; /* Google Blue */
      }
      25% {
        stroke: #ea4335; /* Google Red */
      }
      50% {
        stroke: #fbbc05; /* Google Yellow */
      }
      75% {
        stroke: #34a853; /* Google Green */
      }
      100% {
        stroke: #4285f4; /* Google Blue */
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible: boolean = false; // Make visibility an input property
}