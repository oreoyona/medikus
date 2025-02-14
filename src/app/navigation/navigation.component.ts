import { map, shareReplay } from 'rxjs/operators';
import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { ModulesModule } from './modules.module';
import { inject, OnInit, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Cours, ecgCours, TextContent, Video, CourseModule, QuizContent } from '../common/infercaces';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationService } from './navigation.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: true,
  imports: [ModulesModule, MatListModule, NgFor, NgIf, MatTabsModule, AsyncPipe, MatIconModule, MatButtonModule, NgClass, MatCardModule]
})
export class NavigationComponent implements OnInit {

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
  currentModule: CourseModule<Video | TextContent | QuizContent> | null = null;

  modules = ecgCours.modules;
  coursArray = [ecgCours, ecgCours, ecgCours];
  cours: Cours = ecgCours;
  isSmall: any;

  ngOnInit(): void {
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