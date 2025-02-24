import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { UpperCasePipe, DatePipe, SlicePipe } from '@angular/common';
import { HeaderComponent } from "../common/header/header.component";
import { MatGridListModule } from "@angular/material/grid-list";
import { FooterComponent } from "../common/footer/footer.component";
import { CourseData, CourseService, ServerDataResponse } from '../admin/course.service';
import { DefaultImgDirective } from '../common/default-img.directive';
@Component({
  selector: 'app-home',
  imports: [MatIconModule, RouterLink, MatButtonModule, UpperCasePipe, DatePipe, HeaderComponent, MatCardModule, MatGridListModule, FooterComponent, SlicePipe, DefaultImgDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [],

})
export class HomeComponent implements OnInit {
  courseService = inject(CourseService)
  courses!: CourseData[]
  coursesFirstFive!:CourseData[]

  constructor() {

  }

  ngOnInit(): void {
    this.courseService.getCourses().subscribe((res: any) => {
      const data: CourseData[] = res.data.slice(0, 5)
      this.courses = data
    })


  }
  banner = "banner.webp"
  tmp = [0, 1, 2, 3, 4]
  echo = "/public/echo.webp"
  ruban = [
    {
      titre: 'Apprendre',
      link: 'learn'
    },

    {
      titre: 'Abonnement',
      link: 'about',
      fragment: 'subscribe'
    },
    {
      titre: 'Prochaines Activités',
      link: 'events'
    },
    {
      titre: 'Nous Rejoindre',
      link: 'contact',
      fragment: 'join'
    },

    {
      titre: 'Blog',
      link: 'blog'
    }
  ]
  courseTitle = "Course Title";
  courseDate = new Date();
  courseDescription = `Join us to increase awareness about the Supreme Court 2023 Affirmative Action Ruling: What Does It Mean for Health Equity and Public Health?The Office of Faculty Development and Diversity is hosting a faculty webinar with the Health Equity Action Leadership (HEAL) Network and the Stanford Center for Continuing Medical Education (CME) to highlight Health Disparities. `
  courseId = 1;
  yellow: any = "yellow";






}
