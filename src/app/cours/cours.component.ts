import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, switchMap, of, catchError, takeUntil, BehaviorSubject, forkJoin } from 'rxjs';
import { CourseData, CourseService, ModuleData, UserProgress } from '../admin/course.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointService } from '../common/services/breakpoint-service.service';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';
import { HeaderComponent } from "../common/header/header.component";
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

/**
 * Component for displaying and interacting with a course, handling module and part completion.
 */
@Component({
  selector: 'app-cours',
  imports: [
    MatListModule,
    RouterLink,
    MatCardModule,
    RouterOutlet,
    AsyncPipe,
    HeaderComponent,
    MatDividerModule,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.scss'
})
export class CoursComponent implements OnInit, OnDestroy {

  router = inject(ActivatedRoute);
  courseService = inject(CourseService);
  authService = inject(AuthService);
  route = inject(Router);
  breakpointService = inject(BreakpointService);

  private destroy$ = new Subject<void>();
  courseDataSubject = new BehaviorSubject<CourseData | null>(null);
  courseData$ = this.courseDataSubject.asObservable();

  leftMenuVisible = true;
  userProgress: UserProgress | null = null;
  courseId: number = 0;
  allModulesCompleted = signal(false);

  currentUser = this.authService.currentUser;

  /**
   * Converts an array of modules or undefined to an array of modules.
   * @param modules The modules to convert.
   * @returns An array of modules.
   */
  asModuleArray(modules: ModuleData[] | undefined): ModuleData[] {
    return modules || [];
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   * Completes the destroy$ subject to unsubscribe from observables.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Lifecycle hook called when the component is initialized.
   * Fetches course data and user progress, and updates the UI.
   */
  ngOnInit() {
    if (this.currentUser) {
      this.router.paramMap
        .pipe(
          switchMap((params) => {
            this.courseId = Number(params.get('id'));
            return this.courseService.getCourseById(this.courseId).pipe(
              catchError((error) => {
                console.error('Error fetching course:', error);
                return of(null);
              })
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((res: any) => {
          if (res && res.data) {
            this.courseDataSubject.next(res.data);
            this.loadUserProgress();

            // Navigate to the first module if it exists
            if (res.data.modules && res.data.modules.length > 0) {
              this.route.navigate(['.', { outlets: { module: res.data.modules[0].link } }], { relativeTo: this.router });
            }
          }
        });

      this.checkAndUpdateCourseCompletion();
    }
  }

  /**
   * Loads the user's progress for the current course from the local database.
   */
  loadUserProgress(): void {
    const userId = Number(this.currentUser?.id);
    this.courseService.getUserProgress(userId, this.courseId).subscribe((progress) => {
      this.userProgress = progress;
      //if there is no local progress, create a new empty one with the [UserId, CourseId] Key
      if (!this.userProgress) {
        this.userProgress = {
          userId: userId,
          courseId: this.courseId,
          completedModules: [],
          completedParts: {},
        };
        this.courseService.createOrUpdateUserProgress(this.userProgress).subscribe();
      }
      this.updateAllModulesCompleted();
    });
  }

  /**
   * Marks a module as completed for the user.
   * @param moduleId The ID of the module to mark as completed.
   */
  markModuleCompleted(moduleId: number): void {
    if (this.userProgress) {
      this.courseService.markModuleCompleted(this.currentUser?.id as number, this.courseId, moduleId, this.userProgress).subscribe(updatedProgress => {
        this.userProgress = updatedProgress;
        this.updateAllModulesCompleted();
      });
    }
  }

  /**
   * Marks a part as completed for the user.
   * @param moduleId The ID of the module containing the part.
   * @param partId The ID of the part to mark as completed.
   */
  markPartCompleted(moduleId: number, partId: number): void {
    if (this.userProgress) {
      this.courseService.markPartCompleted(this.currentUser?.id as number, this.courseId, moduleId, partId, this.userProgress)
        .pipe(
          catchError(err => {
            console.log(err);
            return of(err);
          })
        )
        .subscribe(updatedProgress => {
          this.userProgress = updatedProgress;
          this.checkModuleCompletion(moduleId);
        });
    }
  }

  /**
   * Checks if all parts of a module are completed and marks the module as completed if so.
   * @param moduleId The ID of the module to check.
   */
  checkModuleCompletion(moduleId: number): void {
    if (this.courseDataSubject.value && this.userProgress) {
      const module = this.courseDataSubject.value.modules[moduleId];
      const completedParts = this.userProgress.completedParts[moduleId] || [];
      const allPartsCompleted = module.parts.every((_: any, index: number) => completedParts.includes(index));

      if (allPartsCompleted && !this.userProgress.completedModules.includes(moduleId)) {
        this.markModuleCompleted(moduleId);
      }
    }
  }

  /**
   * Gets the names of the completed modules.
   * @returns An array of completed module names.
   */
  getCompletedModuleNames(): string[] {
    if (!this.courseDataSubject.value || !this.userProgress) {
      return [];
    }
    return this.userProgress.completedModules.map(moduleId => {
      return this.courseDataSubject.value!.modules[moduleId].title;
    });
  }

  /**
   * Checks if a module is completed.
   * @param moduleId The ID of the module to check.
   * @returns True if the module is completed, false otherwise.
   */
  isModuleCompleted(moduleId: number): boolean {
    return !!this.userProgress?.completedModules.includes(moduleId);
  }

  /**
   * Checks if a module is completed based on its link.
   * @param moduleLink The link of the module to check.
   * @param modules The array of modules.
   * @returns True if the module is completed, false otherwise.
   */
  isModuleCompletedByLink(moduleLink: string, modules: any[]): boolean {
    const moduleId = modules.findIndex(m => m.link === moduleLink);
    return this.isModuleCompleted(moduleId);
  }

  /**
   * Updates the allModulesCompleted signal based on the completion status of all modules.
   */
  updateAllModulesCompleted(): void {
    if (this.courseDataSubject.value && this.userProgress) {
      const allModules = Object.values(this.courseDataSubject.value.modules);
      const allModulesCompleted = allModules.every((module, moduleId) => this.userProgress!.completedModules.includes(moduleId));
      this.allModulesCompleted.set(allModulesCompleted);
      if (allModulesCompleted) {
        this.courseService.markCourseAsCompleted(this.courseId).subscribe();
      }
    } else {
      this.allModulesCompleted.set(false);
    }
  }

  /**
   * Toggles the visibility of the left menu.
   */
  toggleLeftMenu(): void {
    this.leftMenuVisible = !this.leftMenuVisible;
  }

  /**
   * Closes the left menu overlay.
   */
  closeOverlay(): void {
    this.leftMenuVisible = false;
  }

  /**
   * Checks if the current course has been marked as completed in the database and updates the local state accordingly.
   */
  private checkAndUpdateCourseCompletion(): void {
    forkJoin({
      completed: this.courseService.getCompletedCourses(undefined, ['user']),
      subscriptions: this.courseService.getUserSubscriptions(this.currentUser?.id as number)
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error fetching courses:', error);
          return of({ completed: null, subscriptions: null });
        })
      )
      .subscribe(({ completed, subscriptions }) => {
        if (!subscriptions || !completed) return;

        const completedCourseIds = (completed as any).data.reduce((ids: number[], course: any) => {
          ids.push(course.course_id);
          return ids;
        }, []);

        //check if the course is completed and update the UI
        if (completedCourseIds.includes(this.courseId) && this.courseDataSubject.value) {
          this.allModulesCompleted.set(true)

          const modules = this.courseDataSubject.value.modules;
          const moduleCount = Object.keys(modules).length;
          const completedModules = Array.from({ length: moduleCount }, (_, i) => i);
          const completedParts: { [moduleId: number]: number[] } = {};

          for (let moduleId = 0; moduleId < moduleCount; moduleId++) {
            const partCount = modules[moduleId].parts.length;
            completedParts[moduleId] = Array.from({ length: partCount }, (_, partId) => partId);
          }

          this.userProgress = {
            userId: this.currentUser?.id as number,
            courseId: this.courseId,
            completedModules: completedModules,
            completedParts: completedParts
          };
          this.updateAllModulesCompleted();
        }

        //find the current course in the subscriptions Array and update the UI for every completed modules or part

        if (subscriptions && this.courseDataSubject.value) {
          const subscriptionCourse = (subscriptions as any).courses.find((course: any) => course.course_id === this.courseId);
          if (subscriptionCourse) {
            const serverCompletedModules = subscriptionCourse.completed_modules || [];
            const serverCompletedParts = subscriptionCourse.completed_parts || {};

            // Update UI with server completed modules
            serverCompletedModules.forEach((moduleId: number) => {
              if (!this.userProgress?.completedModules.includes(moduleId)) {
                if(this.userProgress){
                    this.userProgress.completedModules.push(moduleId);
                } else{
                    this.userProgress = {
                        userId : this.currentUser?.id as number,
                        courseId: this.courseId,
                        completedModules: [moduleId],
                        completedParts: {}
                    }
                }
              }
            });

            // Update UI with server completed parts
            Object.keys(serverCompletedParts).forEach((moduleIdStr) => {
              const moduleId = parseInt(moduleIdStr, 10);
              const parts = serverCompletedParts[moduleIdStr] as number[];

              if (!this.userProgress?.completedParts[moduleId]) {
                if(this.userProgress){
                    this.userProgress.completedParts[moduleId] = [];
                }else{
                    this.userProgress = {
                        userId : this.currentUser?.id as number,
                        courseId: this.courseId,
                        completedModules: [],
                        completedParts: {[moduleId]: []}
                    }
                }

              }

              parts.forEach((partId) => {
                if (!this.userProgress?.completedParts[moduleId].includes(partId)) {
                  this.userProgress?.completedParts[moduleId].push(partId);
                }
              });
            });

            this.updateAllModulesCompleted();
          }
        }
      });
  }
}