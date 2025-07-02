import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CoursComponent } from '../cours.component';
import { ModuleData } from '../../admin/course.service';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { HelpersService } from '../../common/services/helpers.service';
import { QuestionsComponent } from "../questions/questions.component";
import { CoursesHelpersService } from '../../common/services/courses-helpers.service';

@Component({
  selector: 'app-module-content',
  templateUrl: './module-content.component.html',
  styleUrl: './module-content.component.scss',
  standalone: true,
  imports: [
    MatTabsModule,
    YouTubePlayerModule,
    QuestionsComponent
],
})
export class ModuleContentComponent implements OnInit, OnDestroy, AfterViewInit {
  module: ModuleData | undefined;
  private route = inject(ActivatedRoute);
  courseComponent = inject(CoursComponent);

  private hs = inject(HelpersService);
  courseHService = inject(CoursesHelpersService)
  private destroy$ = new Subject<void>();
  private sanitizer = inject(DomSanitizer);
  @ViewChild('divForContent') divForContent: ElementRef | undefined;

  partCompletionStatus: boolean[] = [];

  handleQuizSuccess(partIndex: number): void {
    this.markPartCompleted(partIndex); 
  }

  ngOnInit() {
    this.courseComponent.courseData$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(course => {
          if (course) {
            return this.route.paramMap.pipe(
              switchMap(params => {
                const moduleLink = params.get('module');
                if (moduleLink) {
                  this.module = course.modules.find((m: ModuleData) => m.link === moduleLink);
                  return this.courseComponent.courseService.getUserProgress(this.courseComponent.currentUser?.id as number, this.courseComponent.courseId);
                }
                return of(null);
              })
            );
          }
          return of(null);
        })
      )
      .subscribe(userProgress => {
        if (userProgress) {
          this.courseComponent.userProgress = userProgress;
          this.initializePartCompletionStatus();
        }
      });




  }
  initializePartCompletionStatus(): void {
    if (this.module) {
      this.partCompletionStatus = new Array(this.module.parts.length).fill(false);
      this.updatePartCompletionStatusFromUserProgress();
    }
  }


  updatePartCompletionStatusFromUserProgress(): void {
    if (this.module && this.courseComponent.userProgress) {
      const moduleId = this.courseComponent.asModuleArray(this.courseComponent.courseDataSubject.value?.modules).findIndex(m => m.link === this.module?.link);
      const completedParts = this.courseComponent.userProgress.completedParts[moduleId] || [];
      this.partCompletionStatus = this.module.parts.map((_, index) => completedParts.includes(index));
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showHtmlContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  getVideoId(url: string) {
    return this.hs.extractYouTubeVideoId(url);
  }

  markPartCompleted(partId: number): void {
    if (this.module && this.courseComponent.userProgress) {
      const moduleId = this.courseComponent.asModuleArray(this.courseComponent.courseDataSubject.value?.modules).findIndex(m => m.link === this.module?.link);
      this.courseComponent.markPartCompleted(moduleId, partId);
      this.checkModuleCompletion(moduleId);
      this.partCompletionStatus[partId] = true;
      this.updatePartCompletionStatusFromUserProgress();
    }
  }
  
  checkModuleCompletion(moduleId: number): void {
    if (this.module && this.courseComponent.userProgress) {
      const completedParts = this.courseComponent.userProgress.completedParts[moduleId] || [];
      const allPartsCompleted = this.module.parts.every((_, index) => completedParts.includes(index));
  
      if (allPartsCompleted && !this.courseComponent.userProgress.completedModules.includes(moduleId)) {
        this.courseComponent.markModuleCompleted(moduleId);
        this.updatePartCompletionStatusFromUserProgress();
      }
    }
  }
}