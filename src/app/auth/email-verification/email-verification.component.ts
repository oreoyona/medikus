import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { take, catchError, of, throwError } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HeaderComponent } from "../../common/header/header.component";
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../admin/users/user.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    MatButtonModule
]
})
export class EmailVerificationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar); // Inject MatSnackBar

  verificationStatus: 'verifying' | 'success' | 'error' = 'verifying';
  errorMessage: string | null = null;
  userService = inject(UserService);

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      } else {
        this.verificationStatus = 'error';
        this.errorMessage = 'Invalid verification link.';
      }
    });
  }

  verifyEmail(token: string){
    this.userService.verifyEmail(token).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMessage = 'Vous avez déjà activé votre compte. Veuillez vous connecter.';
        } else {
          this.errorMessage = err.error.message || 'Verification failed.';
        }
        this.verificationStatus = 'error';
        return of(err)
      })
    ).subscribe((response: any) => {
        this.verificationStatus = 'success';
      }
    );
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}