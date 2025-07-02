import { Component, inject, OnInit, Signal, signal, WritableSignal, OnDestroy, DestroyRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { User } from '../common/infercaces';
import { UserService } from '../admin/users/user.service';
import { HeaderComponent } from "../common/header/header.component";
import { Subject, takeUntil, catchError, of, forkJoin, timer, interval } from 'rxjs'; // Added imports
import { CourseData, CourseService } from '../admin/course.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HelpersService } from '../common/services/helpers.service';
import { FormatDatePipe } from '../common/pipes/format-date.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MdkCalendarComponent } from "../common/mdk-calendar/mdk-calendar.component";
import { CoursesHelpersService } from '../common/services/courses-helpers.service';

interface ApiResponse<T> {
  message: string;
  data: any;
  courses: T[];
}

interface completedCourseData {
  completed_at: Date
  course_id: number
  course_name: string
}

@Component({
  selector: 'app-profile',
  imports: [
    MatCardModule,
    RouterLink,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    HeaderComponent,
    MatProgressSpinnerModule,
    FormatDatePipe,
    MdkCalendarComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {


  /** Used to automatically unsubscribe from observables when the component is destroyed. */
  private destroyRef = inject(DestroyRef);

  /**
   * Method to handle certification demands
   * @param courseId 
   */
  askCertificate(courseId: any) {
  
  }
  unsubscribe(courseId: any) {
    this.courseService.unsubscribe(courseId as number).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error) => {
        this.errorMessage.set(this.userService.printElegantMessageErrors(1000))
        return of(error)
      })

    )
      .subscribe(() => {
        this.successMessage.set("Désincription réussie")
      })
  }

  currentUser: User | null = null;
  authService = inject(AuthService);
  userService = inject(UserService);
  route = inject(ActivatedRoute);
  courseService = inject(CourseService);
  courseHService = inject(CoursesHelpersService)
  hs = inject(HelpersService)
  router = inject(Router);

  profileCertificats: WritableSignal<any[]> = signal([]);
  courseId = 1;
  selectedTabIndex = 0;
  completedCourses: Array<completedCourseData> = [];
  nonCompletedCourses: any[] = [];
  nonCompletedCoursesArray!: Array<CourseData>
  loading: boolean = true;
  errorMessage: WritableSignal<string | null> = signal(null)
  successMessage: WritableSignal<string | null> = signal(null)
  counter: number = 5;
  defaultMessage: WritableSignal<string | null> = signal(null)
  private destroy$ = new Subject<void>(); // Subject for unsubscribing

  ngOnInit() {

    this.fetchCurrentUser();
    this.fetchCertificates();
    this.subscribeToQueryParams();
    this.loadCourses();



  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getDatesFromString(str: string | undefined){
    if (str) return this.courseHService.extractDatesFromString(str)
    return []
  }


  getWidth(progress: any): string {
    if (!progress) {
      progress = 0
    }
    return `${progress}%`;
  }

  getImgUrl(url: any) {
      return this.hs.validateAndReturnUrl(url)
  }
  private loadCourses(): void {
    this.loading = true;
    const userId = Number(this.authService.currentUserSubject?.value?.id);

    if (!userId) {
      console.error('User ID is null or undefined.');
      this.errorMessage.set(`Veuillez vous connecter pour afficher cette page`)
      this.loading = false;
      return;
    }
    

    forkJoin({
      completed: this.courseService.getCompletedCourses(undefined, ['user']),
      subscriptions: this.courseService.getUserSubscriptions(userId)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: HttpErrorResponse | any) => {

          if ((error as HttpErrorResponse).status == 0) {
            this.errorMessage.set(this.userService.printElegantMessageErrors(0))
          }
          this.loading = false;
          return of({ completed: undefined, subscriptions: undefined }); // Return null objects
        })
      )
      .subscribe(({ completed, subscriptions }) => {
        //subscriptions is an array of Ids and subscriptions has the datastructure: {'data': courseIds, message: number, courses: CourseData[] }
        //If there is no courses


        if(!subscriptions || !(subscriptions as any).data.length || (subscriptions as any).data.length === 0){
          this.defaultMessage.set("Vos cours seront affichés ici")
          this.nonCompletedCourses = [];
          this.completedCourses = []
          this.loading = false
          return;
        }

        else {
          this.nonCompletedCoursesArray = (subscriptions as ApiResponse<CourseData>).courses

        }

        if (completed && completed.data) {

          this.completedCourses = completed.data
          this.nonCompletedCoursesArray = this.nonCompletedCoursesArray.reduce<CourseData[]>((acc, course) => {
            if (!this.completedCourses.some(completedCourse => completedCourse.course_id === course.id)) {
              acc.push(course);
            }
            return acc;
          }, []);


        } else {
          this.completedCourses = []; // Ensure it's not undefined
        }

        const subscribedCourseIds = (subscriptions as any).data as Array<number>;

        this.nonCompletedCourses = subscribedCourseIds.filter((courseId: any) => {
          return !this.completedCourses.some(completedCourse => completedCourse.course_id === courseId);
        });



        this.loading = false;
      });
  }



  private fetchCurrentUser(): void {
    const userId = this.authService.currentUserSubject.value?.id as number
    if (userId) {
      this.userService.getUserById(userId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            console.error('Error fetching user:', error);
            return of(null); // Return null in case of error
          })
        )
        .subscribe((res: any) => {
          if (res && res.data) {
            this.currentUser = res.data;
          }
        });
    } else {
      console.error('User ID is null or undefined.');
    }
  }


  private fetchCertificates(): void {
  }

  private subscribeToQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const tabIndex = params['tab'];
        if (tabIndex) {
          this.selectedTabIndex = +tabIndex;
        }
      });
  }
}