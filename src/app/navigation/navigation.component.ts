import { map, shareReplay } from 'rxjs/operators';
import { Component } from '@angular/core';
import { ModulesModule } from './modules.module';
import { inject, OnInit, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Cours, ecgCours, TextContent, Video, CourseModule, QuizContent } from '../common/infercaces';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: true,
  imports: [
    ModulesModule, MatListModule, NgFor, NgIf, MatTabsModule
  ]
})
export class NavigationComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  trackByFn(index: number, item: any) {
    return item.link; 
  }

  currentModule: CourseModule<Video | TextContent | QuizContent> | null = null;

  modules = ecgCours.modules;
  coursArray = [ecgCours, ecgCours, ecgCours];
  cours: Cours = ecgCours;

  ngOnInit(): void {
    this.setCurrentModule(this.cours.modules[0]);
  }

  constructor(private _sanitizer: DomSanitizer) {
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