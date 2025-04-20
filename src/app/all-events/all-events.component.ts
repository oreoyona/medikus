import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Webinaire } from '../common/infercaces';
import { CourseData, CourseService } from '../admin/course.service';
import { WebinaireService } from '../admin/create-webinaire/webinaire.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from "../common/header/header.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { HelpersService } from '../common/services/helpers.service';

@Component({
  selector: 'app-all-events',
  imports: [
    HeaderComponent,
    MatCardModule,
    MatButtonModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink
  ],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.scss'
})
export class AllEventsComponent implements OnInit {

  courseService = inject(CourseService);
  webinaireService = inject(WebinaireService);
  destroyRef = inject(DestroyRef)
  hs = inject(HelpersService)

  upComingWebinaires: WritableSignal<Webinaire[] | null> = signal(null);
  upcomingCourses: WritableSignal<CourseData[] | null> = signal(null);

  filteredCourses: WritableSignal<CourseData[]> = signal([]);
  filteredWebinaires: WritableSignal<Webinaire[]> = signal([]);

  


  ngOnInit(): void {
    forkJoin({
      courses: this.courseService.getCourses(),
      webinaires: this.webinaireService.getWebinaires(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ courses, webinaires }) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Filter upcoming courses
        const filteredCoursesResult = ((courses as any).data as CourseData[]).filter((course) => {

          const startDate = new Date(course.date);

          startDate.setHours(0, 0, 0, 0);
          return startDate > currentDate;
        }) as CourseData[] | undefined;



        this.upcomingCourses.set(filteredCoursesResult || null);
        this.filteredCourses.set(filteredCoursesResult || []); // Initialize filtered courses

        // Filter upcoming webinaires
        const filteredWebinairesResult = ((webinaires as any).data as Webinaire[]).filter((webinaire) => {
          const startDate = new Date(webinaire.date!);
          startDate.setHours(0, 0, 0, 0);
          return startDate > currentDate;
        }) as Webinaire[] | undefined;

        this.upComingWebinaires.set(filteredWebinairesResult || null);
        this.filteredWebinaires.set(filteredWebinairesResult || []); // Initialize filtered webinaires
      });
  }


  getImgUrl(url: string | null): string {
    const validatedUrl = this.hs.validateAndReturnUrl(url); 

    if (validatedUrl) {
      return validatedUrl; // Return the valid URL if it's valid
    } else {
      return 'info-banner.webp'; // Return the fallback URL if it's invalid
    }
  }

  filterCourses(filterValue: MatSelectChange): void {
    var courses = this.upcomingCourses();
    if (!courses) {
      this.filteredCourses.set([]);
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let targetDate: Date;
    switch (filterValue.value) {
      case '1':
        targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + 7);
        break;
      case '2':
        targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + 14);
        break;
      case '3':
        targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + 21);
        break;
      case '4':
        targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + 28);
        break;
      case 'all':
      case 0:
      default:
        this.filteredCourses.set(courses);
        return;
    }

    const filtered = courses.filter(course => {
      const startDate = new Date(course.date!);
      startDate.setHours(0, 0, 0, 0);

      // Calculate the date exactly one week from the current date for comparison
      const oneWeekFromNow = new Date(currentDate);
      oneWeekFromNow.setDate(currentDate.getDate() + 7);

      // Return true only if the course starts on the date exactly one week from now
      return startDate.getTime() === oneWeekFromNow.getTime();
    });

    this.filteredCourses.set(filtered);


  }


  filterWebinaires(filterValue: string | any): void {
    const webinaires = this.upComingWebinaires();
    if (!webinaires) {
      this.filteredWebinaires.set([]);
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let endDate: Date;
    switch (filterValue) {
      case '1':
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 7);
        break;
      case '2':
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 14);
        break;
      case '3':
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 21);
        break;
      case '4':
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 28);
        break;
      case 'all':
      default:
        this.filteredWebinaires.set(webinaires);
        return;
    }

    const filtered = webinaires.filter(webinaire => {
      const startDate = new Date(webinaire.date!);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= currentDate && startDate <= endDate;
    });
    this.filteredWebinaires.set(filtered);
  }

 



}


