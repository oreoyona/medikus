import { catchError, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Component, ElementRef, OnDestroy, ViewChild, viewChild } from '@angular/core';
import { ModulesModule } from './modules.module';
import { inject, OnInit, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of, Subject } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Cours, ecgCours, TextContent, Video, CourseModule, QuizContent } from '../common/infercaces';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationService } from './navigation.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BreakpointService } from '../common/services/breakpoint-service.service';
import { CourseData, CourseService } from '../admin/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: true,
  imports: [
    ModulesModule,
    MatListModule,
    NgFor, NgIf,
    MatTabsModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    NgClass,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class NavigationComponent implements OnInit, OnDestroy {

  showMenuIcon = true;
  showCloseIcon = false;
  showSidingMenu = false;

  showSiding() {
    this.showMenuIcon = !this.showMenuIcon
    this.showCloseIcon = !this.showCloseIcon
    this.showSidingMenu = !this.showSidingMenu
  }


  trackByFn(index: number, item: any) {
    return item.link;
  }


  navigationService = inject(NavigationService);
  bs = inject(BreakpointService)
  router = inject(ActivatedRoute)
  courseService = inject(CourseService)
  route = inject(Router)
  currentModule: CourseModule<Video | TextContent | QuizContent> | null = null;

  modules = ecgCours.modules;
  coursArray = [ecgCours, ecgCours, ecgCours];
  cours: Cours = ecgCours;
  isSmall: any;
  mobile = this.bs.mobile
  formArray = this.courseService.toFormArray

  private destroy$ = new Subject<void>();
  courseId: number | null = null;
  course: CourseData | null = null;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.router.paramMap.pipe(
      switchMap(params => {
        this.courseId = Number(params.get('id'));
        if (isNaN(this.courseId)) {
          // Handle invalid course ID
          this.route.navigate(['/']);
          return of(null); // Stop the observable chain
        }
        return this.courseService.getCourseById(this.courseId)
        .pipe(
          catchError(error => {
            console.error('Error fetching course:', error);
            // Handle specific errors (e.g., 404)
            this.route.navigate(['/']); // Or show an error message
            return of(null); // Stop the observable chain
          })
        )
      }),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if (res && res.data) {
        this.course = res.data;

      }
    });

    this.setCurrentModule(this.cours.modules[0]);
    this.isSmall = this.navigationService.isSmall$
  }

  constructor() {
  }

  setCurrentModule(module: CourseModule<Video | TextContent | QuizContent>) {
    this.currentModule = module;
  }

  isTextContent(content: Video | TextContent | QuizContent): content is TextContent {
    return 'text' in content;
  }

  isVideoContent(content: Video | TextContent | QuizContent): content is Video {
    return 'videoLink' in content;
  }

  isQuizContent(content: Video | TextContent | QuizContent): content is QuizContent {
    return 'questions' in content;
  }
  
}