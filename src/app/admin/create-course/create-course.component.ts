import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../course.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import { CkeditorComponent } from "../../ckeditor/ckeditor.component";
import { ServerResponse } from '../../common/infercaces';
import { Router } from '@angular/router';
import { ImageUploadComponent } from "../../common/image-uploader.component";


@Component({
  selector: 'app-create-course',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    FormsModule,
    CkeditorComponent,
    ImageUploadComponent
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {

  constructor(){

  }

  courseService = inject(CourseService);
  fb = inject(NonNullableFormBuilder);
  options = this.courseService.options;
  typeOptions = this.courseService.typeOptions;
  readonly dialog = inject(MatDialog);
  route = inject(Router)
  errorMessage: WritableSignal<string | null> = signal(null)
  successMessage: WritableSignal<string | null> = signal(null)


  newCourseForm = new FormGroup({
    name: new FormControl(""),
    imgUrl: new FormControl(""),
    date: new FormControl(""),
    description: new FormControl(""),
    objectifs: new FormControl(""),
    courseType: new FormControl("CourseType"),
    target: new FormControl(""),
    instructor: new FormControl(""),
    instructorImgUrl: new FormControl(""),
    contact: new FormControl(""),
    registering: new FormControl(""),
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
    if(this.newCourseForm.valid){
      this.courseService.createCourse(this.newCourseForm.value).subscribe({
        next: (response: ServerResponse) => {
          if (response.message == "201") {
            this.newCourseForm.reset()
            this.successMessage.set("Le cours a bien été créé")

          }
        },
        error: (error) => {
           this.errorMessage.set("Une erreur est survenue. Veuillez essayer plus tard");
          console.error('Error creating course:', error)
        }
       
      });

    }else{
      console.log(this.newCourseForm.value)
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