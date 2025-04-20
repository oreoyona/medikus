import { Component, inject, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatRippleModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../common/services/header.service';
import { loginWithGoogleUrl } from '../../urls';
import { single } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../admin/users/user.service';


const googleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>`
@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatRippleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component-form.html',
  styles: ` .mdk-container{
      min-height: 100%;
    }

    hr{
      border: 1px solid rgb(64,64,64);
      width: 130px;
      
    }
    .field{
      max-width: 400px;
    }
  
  
  `


})
export class LoginFormComponent implements OnInit {
  showPwd = false
  authService = inject(AuthService)
  rippleColor = "blue";
  credentialsError = false
  router = inject(Router)
  route = inject(ActivatedRoute)
  hs = inject(HeaderService)
  googleUrl = loginWithGoogleUrl;
  isLoading = signal(false)
  errorMessage: WritableSignal<string | null> = signal(null)
  us = inject(UserService)

  //Login Form

  LoginForm = new FormGroup({
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required)
  })

  changeInputType(_t33: HTMLInputElement) {
    this.showPwd = !this.showPwd
    _t33.type == "password" ? _t33.type = "text" : _t33.type = "password"
  }

  sendForm() {
    this.isLoading.set(true)
    if (this.LoginForm.valid) {
      localStorage.setItem("email", this.LoginForm.value.email!)
      this.authService.logInUser(this.LoginForm.value).subscribe({

        next: (res) => {
          this.isLoading.set(false)
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          localStorage.setItem('refresh_token', res.refresh_token);

          // Update current user subject
          this.authService.currentUserSubject.next(res.user);
          this.authService.currentUser = res.user
          this.authService.isAuthenticated.set(true)

          //update the authService

          this.authService.currentAcessTokenSubject.next(res.access_token);


          // Get the returnUrl from query parameters or default to the dashboard

          let redirectUrl = this.authService.getRedirectUrl();
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          if (res.user.role === "admin") {
            // Admin logic:
            if (returnUrl) {
              // If there's a returnUrl in query params, use it
              this.router.navigateByUrl(returnUrl);
            } else if (redirectUrl) {
              // If there's a stored redirect URL, use it
              this.router.navigateByUrl(redirectUrl);
            } else {
              // If no redirect info, go to the admin dashboard
              this.router.navigateByUrl("admin");
            }
          } else {
            // Non-admin logic:
            if (returnUrl) {
              // if there is a return url in the query params, use it.
              this.router.navigateByUrl(returnUrl);
            } else if (redirectUrl) {
              // If there's a stored redirect URL, use it
              this.router.navigateByUrl(redirectUrl);
            } else {
              // If no redirect info, go to the dashboard
              this.router.navigateByUrl('dashboard');
            }
          }


        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false)

          if (error.status === 0) {
            this.errorMessage.set(this.us.printElegantMessageErrors(0))
          }

          const setErrorsAndReset = (errors: any) => {
            //reset the form value
            //using forme.reset will dissable the control erros msg

            this.LoginForm.controls['email'].setValue("");
            this.LoginForm.controls['password'].setValue("");

            //set the errors
            this.LoginForm.controls['email'].setErrors(errors);
            this.LoginForm.controls['password'].setErrors(errors);




          };

          switch (error.status) {
            case 403:
              this.router.navigate(["/auth/activation"]);
              break
            case 400:
            case 401:
            case 500:
              setErrorsAndReset({ error: true });
              break;
            case 404:
              this.LoginForm.controls['email'].setErrors({ notFound: true });

              break;
            case 0:
              this.errorMessage.set(this.us.printElegantMessageErrors(0))
              break;
            default:
              setErrorsAndReset({ error: true });
          }

        },
        complete: () => {
          this.isLoading.set(false)

        }
      });
    } else {
      console.warn('Form is invalid. Please fill in all required fields.');
    }
  }


  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIconLiteral('google-icon', sanitizer.bypassSecurityTrustHtml(googleSvg));
  }
  ngOnInit(): void {
    this.authService.isAuthenticated() ? this.router.navigate(['']) : null
  }

}