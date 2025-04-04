import { Component, inject, OnInit, signal, OnDestroy, DestroyRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CourseData, CourseService } from '../admin/course.service';
import { AuthService } from '../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { HeaderComponent } from "../common/header/header.component";
import { LoadingButtonDirective } from "../common/directives/loading-button.directive"
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormatDatePipe } from '../common/pipes/format-date.pipe';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DefaultImgDirective } from '../common/default-img.directive';

/**
 * @Component SingleCoursComponent
 * @description Displays detailed information about a single course and handles user subscriptions.
 *
 * This component fetches course data, manages user subscription status, and provides
 * functionality to subscribe and unsubscribe from courses. It also handles loading states
 * and error messages.
 */
@Component({
  selector: 'app-single-cours',
  imports: [
    MatButtonModule,    
    MatCardModule,
    HeaderComponent,
    LoadingButtonDirective,
    RouterLink,
    LoadingSpinnerComponent,
    FormatDatePipe ,
    MatIconModule,
    DefaultImgDirective
  ],
  templateUrl: './single-cours.component.html',
  styleUrl: './single-cours.component.scss'
})
export class SingleCoursComponent implements OnInit, OnDestroy {
  /** The course data to display. Initialized as null. */
  course: CourseData | null = null;

  /** Injects the CourseService for fetching course data. */
  courseService = inject(CourseService);

  /** Injects the AuthService for managing user authentication and course subscriptions. */
  authService = inject(AuthService);

  /** Injects the ActivatedRoute for accessing route parameters. */
  route = inject(ActivatedRoute);

  /** Injects the Router for navigation. */
  router = inject(Router);

  /** The ID of the course, extracted from the URL. */
  courseId = Number(this.authService.getLastUrlStr());

  /** Signal indicating whether the user is subscribed to the course. */
  subscribed = signal(false);

  /** The current logged-in user. */
  currentUser = this.authService.currentUser;

  /** Signal indicating whether the subscription button is in a loading state. */
  loadingBtn = signal(false);

  /** Signal for displaying error messages. */
  errorMessage = signal("");

  /** Signal indicating whether the course data is being loaded. */
  loadingCourse = signal(true);

  /** Used to automatically unsubscribe from observables when the component is destroyed. */
  private destroyRef = inject(DestroyRef);



  ngOnInit(): void {
    this.fetchCourseData();
    if (this.currentUser) {
      this.fetchUserSubscriptions();
    }
  }



  /**
   * @method fetchCourseData
   * @description Fetches course data from the CourseService and updates the component's state.
   */
  fetchCourseData(): void {
    this.courseService.getCourseById(this.courseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.checkSubscriptionStatus();
        this.loadingCourse.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to fetch course data.');
        this.loadingCourse.set(false);
      }
    });
  }

  /**
   * @method fetchUserSubscriptions
   * @description Fetches user subscriptions from the CourseService and updates the AuthService.
   */
  fetchUserSubscriptions(): void {
    this.courseService.getUserSubscriptions(this.currentUser?.id as number).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.authService.updateUserCourses(res.data);
        this.checkSubscriptionStatus();
      },
      error: (err) => {
        this.errorMessage.set('Failed to fetch user subscriptions.');
      }
    });
  }

  /**
   * @method checkSubscriptionStatus
   * @description Checks if the user is subscribed to the course and updates the 'subscribed' signal.
   */
  checkSubscriptionStatus(): void {
    if (this.course && this.authService.currentUser?.courses) {
      this.subscribed.set(this.authService.currentUser.courses.includes(this.course.id as number));
    }
  }

  /**
   * @method subscribe
   * @description Subscribes the user to the course.
   * If the user is not logged in, redirects to the login page.
   */
  subscribe(): void {
    if (!this.currentUser) {
      this.authService.setRedirectUrl(this.router.url);
      this.router.navigate(['auth/login']);
      return;
    }
    this.courseService.subscribeToCourse(this.course!.id as number).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.subscribed.set(true);
        this.loadingBtn.set(false);
        if (this.authService.currentUser?.courses) {
          this.authService.currentUser.courses.push(this.course!.id as number);
        } else {
          this.authService.currentUser!.courses = [this.course!.id as number];
        }
        this.authService.updateUserCourses(this.authService.currentUser!.courses);
        this.fetchUserSubscriptions();
        this.courseService.initializeCourseProgress(this.course?.modules!, this.courseId)
        
      },
      error: (err) => {
        this.errorMessage.set('Failed to subscribe to course.');
        this.loadingBtn.set(false);
      }
    });
  }

  /**
   * @method unsubscribe
   * @description Unsubscribes the user from the course.
   */
  unsubscribe(): void {
    this.loadingBtn.set(true);
    this.courseService.unsubscribe(this.courseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.subscribed.set(false);
        this.loadingBtn.set(false);
        //deletes the user records for that specific course from the database
        this.courseService.deleteUserRecordsFromIndexDb(this.currentUser?.id as number, this.courseId).subscribe()
        this.fetchUserSubscriptions();
      
      },
      error: (err) => {
        this.errorMessage.set('Failed to unsubscribe from course.');
        this.loadingBtn.set(false);
      }
    });
  }

 
  ngOnDestroy(): void { }
}