import { Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../common/header/header.component";
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../admin/users/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of, take } from 'rxjs';
import { SeePasswordDirective } from '../../common/see-password.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
    HeaderComponent,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class ResetPasswordComponent implements OnInit {

  /** Service to access information about the current route.*/
  private route: ActivatedRoute = inject(ActivatedRoute);

  /**Service for navigation among routes. */
  private router: Router = inject(Router);

  /**Service to build reactive forms with non-nullable controls.*/
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  /**Service to display snack-bar notifications.*/
  private snackBar: MatSnackBar = inject(MatSnackBar);

  /**
   * @member userService
   * @type UserService
   * @description Service for interacting with user-related API endpoints.
   */
  userService: UserService = inject(UserService);

  /**
   * @member authService
   * @type AuthService
   * @description Service for authentication-related functionalities.
   */
  authService: AuthService = inject(AuthService);

  /**
   * @member resetToken
   * @typeWritableSignal<string | null>
   * @description Signal holding the password reset token received from the query parameters.
   */
  resetToken:WritableSignal<string | null> = signal<string | null>(null);

  /**
   * @member resetStatus
   * @typeWritableSignal<'idle' | 'verifying' | 'form' | 'resetting' | 'success' | 'error'>
   * @description Signal representing the current status of the password reset process.
   * Possible values: 'idle', 'verifying', 'form', 'resetting', 'success', 'error'.
   */
  resetStatus:WritableSignal<'idle' | 'verifying' | 'form' | 'resetting' | 'success' | 'error'> =signal<'idle' | 'verifying' | 'form' | 'resetting' | 'success' | 'error'>('idle');

  /**Signal holding the error message to display to the user, if any.*/
  errorMessage: WritableSignal<string | null> = signal(null);

  /**
   * @member resetForm
   * @type FormGroup
   * @description Reactive form for collecting the new password and its confirmation.
   */
  resetForm: FormGroup;

  /**
   * @member isPasswordVisible
   * @typeWritableSignal<boolean>
   * @description Signal controlling the visibility of the new password field.
   */
  isPasswordVisible:WritableSignal<boolean> = signal(false);

  /**
   * @member isConfirmPasswordVisible
   * @typeWritableSignal<boolean>
   * @description Signal controlling the visibility of the confirm password field.
   */
  isConfirmPasswordVisible:WritableSignal<boolean> = signal(false);

  /**
   * @private
   * @member destroyRef
   * @type DestroyRef
   * @description Service for managing the lifecycle of the component and unsubscribing from observables.
   */
  private destroyRef: DestroyRef = inject(DestroyRef);

  /**
   * @constructor
   * @description Initializes the ResetPasswordComponent and sets up the password reset form.
   */
  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, this.authService.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required]
    }, 
    
    { validators: this.authService.passwordMatchValidator() });
  }


  ngOnInit(): void {
    

    this.resetStatus.set('verifying');
    
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((params: ParamMap) => {
      const token = params.get('token');
      if (token) {
        this.resetToken.set(token);
        this.verifyResetToken(token);
      } else {
        this.resetStatus.set('error');
        this.errorMessage.set('Lien de réinitialisation de mot de passe invalide.');
      }
    });
  }

  /**
   * @method verifyResetToken
   * @param token string
   * @description Sends a request to the user service to verify the provided password reset token.
   * Updates the component's state based on the verification result.
   */
  verifyResetToken(token: string): void {
    this.userService.verifyPasswordToken(token).pipe( // Note: This should likely be userService.verifyPasswordResetToken
      takeUntilDestroyed(this.destroyRef),
      take(1),
      catchError((error: HttpErrorResponse) => {
        this.resetStatus.set('error');
        if (error.status === 400 && error.error && error.error.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Le lien de réinitialisation de mot de passe est invalide ou a expiré.');
        }
        return of(null);
      })
    ).subscribe((response: any )=> {
      if (response) {
        this.resetStatus.set('form');
      }
    });


  }

  /**
   * @method onSubmit
   * @description Handles the submission of the password reset form.
   * Sends a request to the user service to set the new password if the form is valid.
   * Updates the component's state based on the password reset operation result.
   */
  onSubmit(): void {
    if (this.resetForm.valid && this.resetToken()) {
      this.resetStatus.set('resetting');
      const newPassword = this.resetForm.get('password')?.value;
      this.userService.setPassword(this.resetToken()!, newPassword).pipe(

        takeUntilDestroyed(this.destroyRef),
        catchError((error: HttpErrorResponse) => {
          this.resetStatus.set('error');
          if (error.status === 400 && error.error && error.error.message) {
            this.errorMessage.set(error.error.message);
          } else {
            this.errorMessage.set('Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.');
          }
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.resetStatus.set('success');
          this.snackBar.open('Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.', 'Fermer', {
            duration: 15000
          });
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.resetStatus.set('error'); // Should be handled by catchError, but for safety
        }
      });
    } else {
      this.errorMessage.set('Veuillez remplir correctement le formulaire.');
    }
  }

  /**
   * @method togglePasswordVisibility
   * @param controlName 'newPassword' | 'confirmPassword'
   * @description Toggles the visibility of the specified password input field.
   */
  togglePasswordVisibility(controlName: 'password' | 'confirmPassword'): void {
    if (controlName === 'password') {
      this.isPasswordVisible.update(value => !value);
    } else if (controlName === 'confirmPassword') {
      this.isConfirmPasswordVisible.update(value => !value);
    }
  }

  /**
   * @method navigateToLogin
   * @description Navigates the user to the login page.
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}