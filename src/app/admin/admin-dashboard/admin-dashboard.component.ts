import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { rubanObject } from '../../common/infercaces'; 
import { CourseService } from '../course.service';
import { UserService } from '../users/user.service';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { NgClass, UpperCasePipe } from '@angular/common';
import { BreakpointService } from '../../common/services/breakpoint-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlogService } from '../../blog/blog.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    MatProgressSpinnerModule,
    UpperCasePipe,
    RouterLink,
    FormsModule,
    MatButtonToggleModule
  ],
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  bs = inject(BreakpointService)
  blogService = inject(BlogService)
  mobile = this.bs.mobile
  destroyRef: DestroyRef = inject(DestroyRef)
  courseService = inject(CourseService);
  userService = inject(UserService);

  articleViews: { id: number, title: string, views_count: number }[] = []; 
  
  blogStatistics: any;
  selectedPeriod: 'total' | 'yearly' | 'monthly' | 'weekly' = 'total';

  dashboardRuban: Array<rubanObject> = [
    { title: 'Nombre total des cours', link: [{ outlets: { admin: ['courses'] } }], icon: '' },
    { title: 'Nombre total d\'utilisateurs', link: [{ outlets: { admin: ['users'] } }], icon: '' },
    { title: 'Nombre d\'utilisateurs actifs (30 jours)', link: [{ outlets: { admin: ['users'] } }], icon: '' },
    { title: 'Nombre de cours complétés (30 jours)', link: [{ outlets: { admin: ['courses'] } }], icon: '' },
    { title: 'Nouvelles inscriptions (30 jours)', link: [{ outlets: { admin: ['users'] } }], icon: '' },
    { title: 'Nombre de certificats délivrés', link: [{ outlets: { admin: ['certificates'] } }], icon: '' },
    { title: 'Vues totales du blog', link: [{ outlets: { admin: ['blog-statistics'] } }], icon: '' }
  ];

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
      blogStats: this.blogService.getPosts().pipe(this.handleApiError('Vues du blog'))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.blogStatistics = data.blogStats;
        this.updateBlogViews();

        this.dashboardRuban[0].value = data.courses?.length ?? 0;
        this.dashboardRuban[1].value = data.users?.length ?? 0;
        this.dashboardRuban[2].value = data.activeUsers?.length ?? 0;
        this.dashboardRuban[3].value = data.completedCourses?.length ?? 0;
        this.dashboardRuban[4].value = data.certificates?.length ?? 0;
        
        if (data.blogStats) {
          this.articleViews = data.blogStats.data.map((post: any) => ({
            id: post.id,
            title: post.title,
            views_count: post.views_count
          }));
        }
      });
  }

  onPeriodChange(period: 'total' | 'yearly' | 'monthly' | 'weekly'): void {
    this.selectedPeriod = period;
    this.updateBlogViews();
  }

  updateBlogViews(): void {
    if (!this.blogStatistics) {
      return;
    }

    const viewsIndex = this.dashboardRuban.findIndex(item => item.title.startsWith('Vues'));
    if (viewsIndex === -1) {
      return;
    }

    let value: number = 0;
    let title: string = '';

    switch (this.selectedPeriod) {
      case 'yearly':
        value = this.blogStatistics.yearly_views_count ?? 0;
        title = 'Vues du blog (annuel)';
        break;
      case 'monthly':
        value = this.blogStatistics.monthly_views_count ?? 0;
        title = 'Vues du blog (mensuel)';
        break;
      case 'weekly':
        value = this.blogStatistics.weekly_views_count ?? 0;
        title = 'Vues du blog (hebdomadaire)';
        break;
      case 'total':
      default:
        value = this.blogStatistics.home_views_count ?? 0;
        title = 'Vues totales du blog';
        break;
    }
    
    // Use the new formatting function before assigning the value
    this.dashboardRuban[viewsIndex].value = this.formatNumber(value);
    this.dashboardRuban[viewsIndex].title = title;
  }
  
  /**
   * Formats a number for readability, adding K, M, or Md suffixes.
   * @param num The number to format.
   * @returns The formatted string.
   */
  private formatNumber(num: number): string | number {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'Md';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  }

  private handleApiError<T>(apiName: string) {
    return (source: Observable<T>): Observable<T | undefined> => {
      return source.pipe(
        catchError((error) => {
          if (error?.status === 401) {
            console.info(`Ignoring 401 Error for ${apiName}`);
            return of(undefined);
          } else if (error.status === 0) {
            console.warn("NO INTERNET")
            return of(undefined)
          } else {
            console.warn(`API Call Failed - ${apiName}:`, error);
            return of(undefined);
          }
        })
      );
    };
  }
}