import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../common/infercaces';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ServerDataResponse } from '../../admin/course.service';
import { UserData, UserService } from '../../admin/users/user.service';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ProfileComponent } from '../profile.component';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../common/header/header.component";

@Component({
  selector: 'app-edit-profile',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    HeaderComponent
],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit{


  ngOnInit(): void {
  
    if (this.currentUser && this.currentUser.id) {
      this.id = this.currentUser.id;

      this.userService.getUserById(Number(this.id)).subscribe((res: any) => {
        const user: UserData = res.data;

        this.editProfileForm.patchValue({
          name: user.name,
          username: user.username,
          email: user.email,
          imgUrl: user.imgUrl,
        });
      });
    } else {
      
      this.route.navigate(['/']); // Redirect if user is not authenticated
    }
  


   


  }
  fb = inject(NonNullableFormBuilder)
  editProfileForm = this.fb.group({
    name:  [''],
    username: [''],
    email: [''],
    imgUrl: [''],

  })
  authService = inject(AuthService)
  userService = inject(UserService)
  route = inject(Router)
  currentUser = this.authService.currentUser
  id = this.currentUser?.id
  


  save(){
    if(this.editProfileForm.valid){
      const newUser: User = {
        id: Number(this.authService.currentUser?.id),
        name: this.editProfileForm.value.name,
        email: this.editProfileForm.value.email,
        imgUrl: this.editProfileForm.value.imgUrl,
        role: this.currentUser?.role,
        
      }

      localStorage.setItem('currentUser', JSON.stringify(newUser));

      this.userService.editUser(Number(this.id), this.editProfileForm.value, this.authService).subscribe((res)=>{
        if(res){
          
          this.route.navigateByUrl("dashboard?tab=1")
        }
      })
    }

  }

}
