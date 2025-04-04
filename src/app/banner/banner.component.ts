import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  template: `
    <section class="banner" [style.backgroundImage]="'url(' + imageUrl + ')'">
      <div class="writtings">
        <span id="banner-title">{{ title }}</span>
        <h4>{{ subtitle }}</h4>
      </div>
    </section>
  `,
  styles: [`
    .banner {
      height: 600px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
        z-index: 1;
      }

      .writtings {
        position: relative;
        z-index: 2;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        max-width: 800px;
        margin: 0 auto;

        #banner-title {
          font-size: 4rem;
          font-weight: 600;
          margin-bottom: 15px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        h4 {
          font-size: 1.4rem;
          font-weight: 300;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
      }
    }

    @media (max-width: 760px) {
      .banner {
        height: 450px;

        .writtings {
          padding: 30px;

          #banner-title {
            font-size: 3rem;
          }

          h4 {
            font-size: 1.2rem;
          }
        }
      }
    }
  `]
})
export class BannerComponent {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
}