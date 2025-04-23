import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormControlName, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatFormField, MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { catchError, Observer, of, throwError, timer } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { UserService } from '../../admin/users/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SeePasswordDirective } from '../../common/see-password.directive';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-inscription-form',
  imports: [
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterLink,
    MatProgressSpinnerModule,
    SeePasswordDirective,
    NgClass,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: 'inscription-form.component.html',
  styles: `
    .available{
      color: var(--bs-success) !important;
    }
    .not-available{
      color: var(--mat-sys-error) !important;
    }
    .mdk-container{
      min-height: 100%;
    }
    .field{
      max-width: 400px;
      width: 100%;
    }
  
  
  `
})
export class InscriptionFormComponent implements OnInit {
  @ViewChild('username') username!: MatFormField
  ngOnInit(): void {
    this.authService.isAuthenticated() ? this.route.navigateByUrl("/dashboard") : null
  }

  registrationSuccess = signal<boolean | null>(null);
  registrationError = signal<string | null>(null);
  authService = inject(AuthService)
  userService = inject(UserService)
  fb = inject(NonNullableFormBuilder)
  route = inject(Router)
  isLoading = signal<boolean>(false); 
  isPwdVisible = false
  userNameAvailable: boolean | null = null;
  isLoadingUsernameCheck = false;
  destroyRef = inject(DestroyRef);
  


 /** Checks the avalability of a username */
  checkUserNameAvailability(username: string, matFormFielControl?: AbstractControl<string | null, string |null> | null) {
    if(matFormFielControl?.valid){
    //mark the formControl as pristine if the user touches it
    matFormFielControl?.markAsPristine;
    matFormFielControl?.markAsUntouched;
    if (!username) {
      this.userNameAvailable = null;
      return;
    }

    this.isLoadingUsernameCheck = true;
    this.userNameAvailable = null;

    const observer: Observer<HttpResponse<any>> = {
      next: (res: HttpResponse<any>) => {
        this.isLoadingUsernameCheck = false;
   
        if (res.status == 200 || res.status == 307) {
          this.userNameAvailable = true;
          this.inscriptionForm.controls.username.setErrors(null);
        }else {
          // Gérer les autres cas (par exemple, erreur inattendue)
          this.userNameAvailable = false;
          this.inscriptionForm.controls.username.setErrors({ notAvailable: true });
        }
      },
      error: (err: any) => {
        this.isLoadingUsernameCheck = false;
        this.userNameAvailable = false;
        this.inscriptionForm.controls.username.setErrors({ notAvailable: true });
      },
      complete: () => {
        // Gérer l'achèvement (si nécessaire)
      }
    };

    this.userService.isuserNameAvailable(username)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(observer);
  }

}

  showPwd(_t33: HTMLInputElement){
    this.isPwdVisible = !this.isPwdVisible
    _t33.type == "password" ? _t33.type = "text" : _t33.type = "password"

  }


  
 

  inscriptionForm = new FormGroup({
    name: new FormControl(""),
    username: new FormControl("", [this.userService.usernameValidator()]),
    email: new FormControl("", Validators.required),
    password: new FormControl("", [Validators.required, this.authService.passwordStrengthValidator()]),
    confirmPassword: new FormControl("", Validators.required)

  }, { validators: this.authService.passwordMatchValidator() });


  sendForm() {
    this.isLoading.set(true); // Set loading to true when form is submitted

    if (this.inscriptionForm.valid) {
      const user = this.fb.group({
        'name': this.inscriptionForm.get("name")?.value,
        'username': this.inscriptionForm.get("username")?.value || "Not set yet",
        'email': this.inscriptionForm.get("email")?.value,
        'password': this.inscriptionForm.get("password")?.value
      })
      this.authService.sendForm(user.value)

        .pipe(
          catchError((err: HttpErrorResponse) => {
            if(err.status == 409){
              this.inscriptionForm.get('email')?.setErrors({'conflict': true})
              this.registrationSuccess.set(false);
              this.registrationError.set("Votre email existe déjà chez Medikus, Veuillez vous connecter")
              this.isLoading.set(false); 

            }

            else if(err.status == 503){
              //email verification failed
              //redirect the user to the login page so he/she can attemps to resend the link
              //Or call for assistance

              this.registrationError.set(
                `Vous avez été enregistré mais vous devez vérifier votre mail.Connectez-vous afin de vérifier votre mail.
                `)
              this.registrationSuccess.set(false);
              this.isLoading.set(false)

            }
            else{
              this.registrationError.set(this.userService.printElegantMessageErrors(err.status));
              this.registrationSuccess.set(false);
              this.isLoading.set(false); // Set loading to false on error
            }


            return throwError(() => err)
          })
        )
        .subscribe((res: any) => {
          this.isLoading.set(false); // Set loading to false after response
         
          if(res.status == 200 || res.status == 201){
            this.registrationSuccess.set(true);
            this.registrationError.set(null);
            
          timer(2000).subscribe(() => {
            this.route.navigate(['/auth/registration-success'])
          })
          }
        

        })
    }

  }


}
