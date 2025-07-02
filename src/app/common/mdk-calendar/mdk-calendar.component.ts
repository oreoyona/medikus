import { Component, inject, Input, input, ViewEncapsulation } from '@angular/core';
import { FormatDatePipe } from "../pipes/format-date.pipe";
import { MatButtonModule } from '@angular/material/button';
import { CoursesHelpersService } from '../services/courses-helpers.service';
import { CourseData } from '../../admin/course.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-mdk-calendar',
  imports: [FormatDatePipe, MatButtonModule, MatCardModule],
  templateUrl: './mdk-calendar.component.html',
  styleUrl: './mdk-calendar.component.scss',
})
export class MdkCalendarComponent {
  @Input() dates!: Date[]
  @Input() course!: CourseData
  today: Date = new Date();
  /**
   * Getter for upcoming dates. Filters and sorts the dates array.
   */
  get upcomingDates(): Date[] {
    const todayWithoutTime = this.convertToDateWithoutTime(this.today);
    return this.dates
      .map(this.convertToDateWithoutTime)
      .filter(date => date >= todayWithoutTime)
      .sort((a, b) => a.getTime() - b.getTime());
  }
   /**
   * Getter for passed sessions. Filters and sorts the dates array.
   */
   get passedSessions(): Date[] {
    const todayWithoutTime = this.convertToDateWithoutTime(this.today);
    return this.dates
      .map(this.convertToDateWithoutTime)
      .filter(date => date < todayWithoutTime)
      .sort((a, b) => a.getTime() - b.getTime());
  }
  /**
   * Helper function to convert a Date or string to a Date object without the time component.
   */
  convertToDateWithoutTime(dateInput: Date | string): Date {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
  }


  location = `numéro 29bis, sur l'avenue Yav Tshibal, au quartier Golf Kabulamenshi`

  courseHService = inject(CoursesHelpersService)
  addToAgenda(date: Date){
    this.courseHService.addToAgenda(date, this.course.name, this.course.description, this.location)
  }


}
