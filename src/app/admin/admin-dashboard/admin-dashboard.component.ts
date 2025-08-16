import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { rubanObject } from '../../common/infercaces'; // Ensure correct import path

import { CourseService } from '../course.service';
import { UserService } from '../users/user.service';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { AsyncPipe, NgClass, UpperCasePipe } from '@angular/common';
import { BreakpointService } from '../../common/services/breakpoint-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    MatProgressSpinnerModule,
    UpperCasePipe

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
      courses: this.courseService.getCourses().pipe(this.handleApiError('Courses')),
      users: this.userService.getAllUsers().pipe(this.handleApiError('Users')),
      activeUsers: this.userService.getActiveUsers(30).pipe(this.handleApiError('Active Users')),
      completedCourses: this.courseService.getCompletedCourses(30).pipe(this.handleApiError('Completed Courses')),
      certificates: this.courseService.getAllCertificates().pipe(this.handleApiError('Certificates')),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.dashboardRuban[0].value = data.courses?.length ?? 0;
        this.dashboardRuban[1].value = data.users?.length ?? 0;
        this.dashboardRuban[2].value = data.activeUsers?.length ?? 0;
        this.dashboardRuban[3].value = data.completedCourses?.length ?? 0;
        this.dashboardRuban[4].value = data.certificates?.length ?? 0;
      });
  }

  private handleApiError<T>(apiName: string) {
    return (source: Observable<T>): Observable<T | undefined> => {
      return source.pipe(
        catchError((error) => {
          if (error?.status === 401) {
            console.info(`Ignoring 401 Error for ${apiName}`);
            return of(undefined); // Or of(null) depending on your preference
          }

          else if (error.status === 0) {
            console.warn("NO INTERNET")
            return of(undefined)
          }

          else {
            console.warn(`API Call Failed - ${apiName}:`, error);
            return of(undefined); // Return undefined to signal failure but allow forkJoin to complete
          }
        })
      );
    };
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