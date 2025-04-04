import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-registration-success',
    template: `
   <div class="registration-container">
  <div class="registration-content">
    <mat-icon class="success-icon">check_circle_outline</mat-icon>
    <h2 class="registration-title">Inscription Réussie !</h2>
    <p class="registration-message">
      Merci de vous être inscrit. Veuillez consulter votre boîte mail pour un lien de confirmation afin d'activer votre compte.
    </p>
  </div>
</div>
  `,
    styles: [`
   
   .registration-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f8f9fa; /* Light gray background */
    }

    .registration-content {
      text-align: center;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 400px; /* Adjust width as needed */
    }

    .success-icon {
      color: #4caf50; /* Green success color */
      margin-bottom: 20px;
    }

    .registration-title {
      font-size: 24px;
      color: #333;
      margin-bottom: 16px;
    }

    .registration-message {
      font-size: 16px;
      color: #555;
      line-height: 1.6;
    }
  `],
    imports: [MatIconModule]
})
export class RegistrationSuccessComponent {
    private router = inject(Router);
    private http = inject(HttpClient); //if you need it.

    constructor() { }

    //Add other methods here if needed.
}