import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../admin/users/user.service';
import { timer } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resend-email',
  templateUrl: './resend-email.component.html',
  styleUrls: ['./resend-email.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule],
})
export class ResendEmailComponent {
  userService = inject(UserService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  isLoading = signal(false);
  resendSuccess = signal<boolean | null>(null);
  resendError = signal<string | null>(null);
  disableForSomeTime = false;

  resendVerificationEmail() {
    this.isLoading.set(true);
    this.resendSuccess.set(null);
    this.resendError.set(null);

    if(!localStorage.getItem('email')){
      this.resendSuccess.set(true)
      return 
    }
    this.userService.resendVerificationEmail(localStorage.getItem('email')!).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.resendSuccess.set(true);
        timer(15000).subscribe(() => {
          this.disableForSomeTime = true
        })
        this.disableForSomeTime = false

        
        this.snackBar.open('Email de vérification renvoyé avec succès. Veuillez vérifier votre boîte de réception.', 'Fermer', {
          duration: 15000,
        });

        //removes the email that was stored in the local storage
        localStorage.removeItem("email")
      },
      error: (error) => {
        this.isLoading.set(false);
        this.resendSuccess.set(false);
        if (error.error && error.error.message) {
          this.resendError.set(error.error.message);
        } else {
          this.resendError.set('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
        }

        this.snackBar.open(this.resendError()!,'Fermer', {
          duration: 5000,
        });
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}