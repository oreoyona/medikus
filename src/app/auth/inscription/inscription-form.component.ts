import { Component, inject, signal } from '@angular/core';
import { FormControl, FormControlName, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,],
  templateUrl: 'inscription-form.component.html',
  styles: `
    .mdk-container{
      min-height: 100%;
    }
    .field{
      max-width: 400px;
    }
  
  
  `
})
export class InscriptionFormComponent {
  authService = inject(AuthService)
  fb = inject(NonNullableFormBuilder)
  route = inject(Router)

  inscriptionForm = new FormGroup({
    name: new FormControl(""),
    username: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", [Validators.required, this.authService.passwordStrengthValidator()]),
    confirmPassword: new FormControl("", Validators.required)

  }, { validators: this.authService.passwordMatchValidator() });


  sendForm() {
   if(this.inscriptionForm.valid){
    const user = this.fb.group({
      'name': this.inscriptionForm.get("name")?.value,
      'username': this.inscriptionForm.get("username")?.value,
      'email': this.inscriptionForm.get("email")?.value,
      'password': this.inscriptionForm.get("password")?.value
    })
    this.authService.sendForm(user.value).subscribe((res)=>{
      this.route.navigate(['/auth/login'])
    }) 
   }
  
  }


}
