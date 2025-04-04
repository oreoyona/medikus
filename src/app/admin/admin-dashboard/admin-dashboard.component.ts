import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { rubanObject } from '../../common/infercaces'; // Ensure correct import path
import { RouterLink } from '@angular/router';
import { CourseService } from '../course.service';
import { UserService } from '../users/user.service';
import { forkJoin } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { BreakpointService } from '../../common/services/breakpoint-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    NgClass,
    MatProgressSpinnerModule
    
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  bs = inject(BreakpointService)
  mobile = this.bs.mobile
  destroyRef: DestroyRef = inject(DestroyRef)
  ngOnInit(): void {
   
    this.loadStatistics();
    

  }

  loadStatistics() {
    forkJoin({
      courses: this.courseService.getCourses(),
      users: this.userService.getAllUsers(),
      activeUsers: this.userService.getActiveUsers(30),
      completedCourses: this.courseService.getCompletedCourses(30),
      certificates: this.courseService.getAllCertificates(),
    })
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    
    .subscribe(({ courses, users, activeUsers, completedCourses, certificates }) => {
      if (Array.isArray(courses)) { // Check if courses is an array
        this.dashboardRuban[0].value = courses.length;
      }
      this.dashboardRuban[1].value = users.length;
      this.dashboardRuban[2].value = activeUsers.length;
      this.dashboardRuban[3].value = completedCourses.length;
      this.dashboardRuban[4].value = certificates.length;
    });
  }


  courseService = inject(CourseService);
  userService = inject(UserService);

  dashboardRuban: Array<rubanObject> = [
    { title: 'Nombre total des cours', link: "[{ outlets: { admin: ['courses'] } }] ", icon: '' },
    { title: 'Nombre total d\'utilisateurs', link: "[{ outlets: { admin: ['users'] } }] ", icon: '' },
    { title: 'Nombre d\'utilisateurs actifs (30 jours)', link: "[{ outlets: { admin: ['users'] } }] ", icon: '' },
    { title: 'Nombre de cours complétés (30 jours)', link: "[{ outlets: { admin: ['courses'] } }] ", icon: '' },
    { title: 'Nouvelles inscriptions (30 jours)', link: "[{ outlets: { admin: ['users'] } }] ", icon: '' },
    { title: 'Nombre de certificats délivrés', link: "[{ outlets: { admin: ['certificates'] } }] ", icon: '' }, // Add certificate ruban.
  ];
}