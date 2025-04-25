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

  location = `numéro 29bis, sur l'avenue Yav Tshibal, au quartier Golf Kabulamenshi`

  courseHService = inject(CoursesHelpersService)
  addToAgenda(date: Date){
    this.courseHService.addToAgenda(date, this.course.name, this.course.description, this.location)
  }


}
