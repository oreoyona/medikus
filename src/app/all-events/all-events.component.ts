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
  standalone: true,
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
          return startDate >= currentDate;
        }) as CourseData[] | undefined;

        this.upcomingCourses.set(filteredCoursesResult || null);
        this.filteredCourses.set(filteredCoursesResult || []); // Initialize filtered courses

        // Filter upcoming webinaires
        const filteredWebinairesResult = ((webinaires as any).data as Webinaire[]).filter((webinaire) => {
          const startDate = new Date(webinaire.date!);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= currentDate;
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
    const courses = this.upcomingCourses();
    if (!courses) {
      this.filteredCourses.set([]);
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Filter all courses if the value is 0 (the default 'all')
    if (filterValue.value === 0) {
      this.filteredCourses.set(courses);
      return;
    }

    // Calculate the end date based on the filter value (in days)
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + filterValue.value);

    // Filter courses that start between the current date and the calculated end date
    const filtered = courses.filter(course => {
      const startDate = new Date(course.date!);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= currentDate && startDate <= endDate;
    });

    this.filteredCourses.set(filtered);
  }

  filterWebinaires(filterValue: MatSelectChange): void {
    const webinaires = this.upComingWebinaires();
    if (!webinaires) {
      this.filteredWebinaires.set([]);
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Filter all webinars if the value is 0 (the default 'all')
    if (filterValue.value === 0) {
      this.filteredWebinaires.set(webinaires);
      return;
    }
    
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + filterValue.value);

    const filtered = webinaires.filter(webinaire => {
      const startDate = new Date(webinaire.date!);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= currentDate && startDate <= endDate;
    });
    this.filteredWebinaires.set(filtered);
  }
}
