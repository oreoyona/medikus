import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../course.service';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import { CkeditorComponent } from "../../ckeditor/ckeditor.component";
import { ServerResponse } from '../../common/infercaces';
import { Router } from '@angular/router';



@Component({
  selector: 'app-create-course',
  imports: [
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatDividerModule,
    MatIconModule, MatDialogModule, MatDatepickerModule,
    NgFor, NgSwitch, NgSwitchCase, FormsModule,
    CkeditorComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {

  courseService = inject(CourseService);
  fb = inject(NonNullableFormBuilder);
  options = this.courseService.options;
  typeOptions = this.courseService.typeOptions;
  readonly dialog = inject(MatDialog);
  route = inject(Router)


  newCourseForm = this.fb.group({
    name: [''],
    imgUrl: [''],
    date: [''],
    description: [''],
    objectifs: [''],
    courseType: ['Choisissez un type'],
    target: [''],
    modules: this.fb.array([]) // Initialize FormArray for modules
  });

  ngOnInit(): void {
    this.addModule();
    this.addPart(0)
  }

  addModule() {
   this.courseService.addModule(this.modules)
  }




  onPartContentTypeChange(moduleIndex: number, partIndex: number) {
   this.courseService.onPartContentTypeChange(this.modules, moduleIndex, partIndex)
  }

  onSubmit() {

    if (this.newCourseForm.valid) {
      // Call the API to create a new course
      this.courseService.createCourse(this.newCourseForm.value).subscribe({
        next: (response: ServerResponse) => {
          if (response.message == "201") {

            this.newCourseForm.reset()

          }
        },
        error: (error) => console.error('Error creating course:', error)
      });
    } else {
      console.error('Form is invalid');
    }
  }

  get modules(): FormArray {
    return this.newCourseForm.get('modules') as FormArray; // Access the FormArray
  }



  toFormArray(control: any) {
    return this.courseService.toFormArray(control)
  }


  addPart(moduleIndex: number) {
    this.courseService.addPart(this.modules, moduleIndex)
  }
  removePart(moduleIndex: number, partIndex: number) {
    this.courseService.removePart(this.modules, moduleIndex, partIndex)
  }

  openDialog(moduleIndex: number) {
    this.courseService.openDialog(this.modules, moduleIndex)
  }

  removeModule(moduleIndex: number) {
    this.courseService.removeModule(this.modules, moduleIndex)
  }





}