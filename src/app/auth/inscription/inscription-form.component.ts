import { Component, inject, signal } from '@angular/core';
import { FormControl, FormControlName, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  
  inscriptionForm = new FormGroup({
    name: new FormControl("", Validators.required),
    tel: new FormControl("", Validators.required),
    password: new FormControl("", [Validators.required, this.authService.passwordStrengthValidator()]),
    confirmPassword: new FormControl("", Validators.required)

  }, { validators: this.authService.passwordMatchValidator() });


  sendForm() {
    this.inscriptionForm.valid ? this.authService.sendForm() : null;
  }


}
