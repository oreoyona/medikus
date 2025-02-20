import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  route = inject(Router)

  constructor(private http: HttpClient) { }

  getLastUrlStr() {
    return this.route.url.split("/")[2];
  }

  sendForm() {
    return this.http.post("api/v1/users", {})
  }

  getUser(form: any) {
    return this.http.post("api/v1/user", form)
  }

  ///VALIDATORS
  
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordsDoNotMatch: true }
        : null;
    };
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;

      // Vérification des critères
      const hasMinimumLength = password && password.length >= 8;
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);

      const valid = hasMinimumLength && hasLowerCase && hasDigit;

      return !valid ? { weakPassword: true } : null;
    };
  }

}
