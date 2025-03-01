import { Component, inject, signal } from '@angular/core';
import { FormControl, FormControlName, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { role } from '../../common/infercaces';
import { Router } from '@angular/router';
import { SeePasswordDirective } from '../../common/see-password.directive';
import { catchError, throwError } from 'rxjs';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-create-user',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,

  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss'
})
export class CreateUserComponent {

  private fb = inject(NonNullableFormBuilder)
  private authService = inject(AuthService)
  public roles: Array<role> = this.authService.roles
  private route = inject(Router)
  showErrorMsg = false
  showSuccessMsg = false
  showPwd = false
  createdUser = signal("")

  inscriptionForm = this.fb.group({
    name: [''],
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', [Validators.required, this.authService.passwordStrengthValidator()]],
    confirmPassword: ['', Validators.required],
    role: [''],

  }, { validators: this.authService.passwordMatchValidator() })

  sendForm() {
    if (this.inscriptionForm.valid) {
      const user = {
        name : this.inscriptionForm.get("name")?.value,
        username: this.inscriptionForm.get("username")?.value,
        email: this.inscriptionForm.get("email")?.value,
        password: this.inscriptionForm.get("password")?.value,
        role: this.inscriptionForm.get("role")?.value
      };
  
    this.authService.createUser(user).pipe(
      catchError((error) => {
        this.showErrorMsg = true
        this.deleteAfter45seconds(this.showErrorMsg)
        return throwError( () => error)
      })
    )
    
    .subscribe((e: any)=>{
      this.createdUser.set(e.name)
      this.showSuccessMsg = true
      this.deleteAfter45seconds(this.showSuccessMsg)
      
    })
  
    }
  
  
  }


  private deleteAfter45seconds(proprety: any){
    if(this.showErrorMsg || this.showSuccessMsg){
      setTimeout(() => {
       proprety = true
      }, 45000);
    }
    this.showErrorMsg = false
    this.showSuccessMsg = false
    
  }

}
