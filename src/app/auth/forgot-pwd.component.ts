import { NgIf } from '@angular/common';
import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../admin/users/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, throwError, timer } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { HeaderComponent } from "../common/header/header.component";

@Component({
    selector: 'app-forgot-password',
    template: `
    <header class="pad-0">
      <app-header />
    </header>
    <div class="d-flex justify-content-center text-center forgot-password-container">
       <mat-card class="p-3">

      
      <h2>Vous avez oublié votre mot de passe ?</h2>
      <p>Entrez votre adresse email pour initier la rénitialisation de votre mot de passe.</p>
      @if(!errorMessage()){
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="resetPassword()">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required>
          <mat-error *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
            Veuillez entrer votre adresse email.
          </mat-error>
        </mat-form-field>

        <button mat-raised-button type="submit" [disabled]="forgotPasswordForm.invalid || delay">
          @if(isLoading){
            <mat-spinner diameter="30"></mat-spinner>
          }
          @else {
            Réinitialiser le mot de passe

          } 
        </button>
      </form>  
        }
  
      
     

      @if(!errorMessage() && resetMessage){
        <div class="reset-message">
        {{ resetMessage }}
      </div>
      }

      @if(errorMessage()){
        <div class="alert alert-danger">
            {{errorMessage()}}
        </div>
      }
      </mat-card>
    </div>
  `,
    styles: [`
    .forgot-password-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 1rem;
      color: #007bff; // Primary color
    }

    p {
      margin-bottom: 1.5rem;
      text-align: center;
      color: #6c757d;
    }

    form {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    button[mat-raised-button] {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      margin-top: 1rem;
    }

    .reset-message {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      text-align: center;
    }
  `],

    imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    HeaderComponent
]
})
export class ForgotPasswordComponent {
    forgotPasswordForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
    });
    sent = signal(false)
    resetMessage: string | null = null;
    userService = inject(UserService)
    destroyRef = inject(DestroyRef)
    errorMessage: WritableSignal<string | null> = signal(null)
    isLoading = false;
    delay = false
    resetPassword() {
      this.isLoading = true
        if (this.forgotPasswordForm.valid) {
            // Simulate password reset logic (replace with your actual backend call)
            const email = this.forgotPasswordForm.value.email;

            this.userService.resetPassword(email!)
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    catchError((error) => {
                        this.errorMessage.set("Une erreur est survenue. Veuillez essayer plus tard")
                        this.isLoading = false
                        return throwError(() => error)
                        
                    })
                )
                .subscribe((res) => {
                    this.isLoading = false
                    this.forgotPasswordForm.reset();
                    this.sent.set(true)
                    this.delay = true
                    timer(15000).subscribe(() => {
                      this.delay = false
                    })
                    this.resetMessage = `Un lien de réinitialisation a été envoyé à ${email}.`;

                })

        }
    }
}