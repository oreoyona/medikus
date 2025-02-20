import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ],
  templateUrl: './login.component-form.html',
  styles: ` .mdk-container{
      min-height: 100%;
    }
    .field{
      max-width: 400px;
    }
  
  
  `


})
export class LoginFormComponent {
  authService = inject(AuthService)

  LoginForm = new FormGroup({
    identifiant: new FormControl("", Validators.required),
    mdp : new FormControl("", Validators.required)
  })

  sendForm(){
    this.LoginForm.valid ? this.authService.getUser(this.LoginForm.value): null
  }
}
