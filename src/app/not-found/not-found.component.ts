import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="container d-flex align-items-center justify-content-center">
      <div class="row justify-content-center">
        <div class="col-md-8 error-container">
          <mat-icon color="warn" style="font-size: 64px; height: 64px; width: 64px;">error_outline</mat-icon>
          <h1>404</h1>
          <p>Oops! La page que vous cherchez n'a pas été retrouvée.</p>
          <button routerLink="/" mat-raised-button color="primary">
            <mat-icon>home</mat-icon> Aller à la page d'acceuil
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom SCSS (compiled to CSS) */
    $primary-color: #3f51b5;
    $accent-color: #e91e63;
    $text-color: #333;
    $error-color: #f44336;

    .container{
        min-height: 79vh;
    }

    .error-container {
      text-align: center;
      padding: 30px;
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

      h1 {
        color: $error-color;
        font-size: 4em;
        margin-bottom: 10px;
      }

      p {
        font-size: 1.2em;
        margin-bottom: 20px;
      }

      /* Styling for the Angular Material button is primarily handled by the directives */
      .mat-raised-button {
        /* You can add minor overrides here if needed */
      }

      .mat-icon {
        vertical-align: middle;
        margin-right: 5px;
      }
    }
  `],
  imports: [MatIconModule, MatButtonModule, RouterLink]
})
export class NotFoundComponent {
}