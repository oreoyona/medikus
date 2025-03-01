import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { User } from '../../common/infercaces';

@Component({
  selector: 'app-users',
  imports: [MatTableModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{
  
  
  
  ngOnInit(): void {

    this.authService.getAllUsers().subscribe(data=>{
     const users = data as Array<User>
     this.dataSource = users
    
    })
   
  }
  authService = inject(AuthService)
  USER_DATA!: User[]

  displayedColumns: string[] = ['id', 'name', 'email', 'role'];
  dataSource!: User[]



}







