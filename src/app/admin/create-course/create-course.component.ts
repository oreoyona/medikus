import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Cours } from '../../common/infercaces';
import { CourseService } from './course.service';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { ModuleFormComponent } from "./module-form/module-form.component";

@Component({
  selector: 'app-create-course',
  imports: [
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    ModuleFormComponent
],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.scss'
})
export class CreateCourseComponent implements OnInit{
  ngOnInit(): void {
    this.addModule()
  }
  
  courseService = inject(CourseService)

  options = this.courseService.options;
  // Create a new form group for the course
  newCourseForm = new FormGroup({
    name: new FormControl(""),
    imgUrl: new FormControl(""),  // Added imgUrl field
    modules: new FormArray([])      // Use FormArray to handle multiple modules
  });

  addModule() {
    const moduleFormGroup = new FormGroup({
      title: new FormControl(""),
      link: new FormControl(""),
      contentType: new FormControl(this.options[0]), // Default to "Questions"
      content: new FormControl(""), // Initialize as FormArray for questions
      parts: new FormArray([])
    });
    (this.newCourseForm.get('modules') as FormArray).push(moduleFormGroup);
    this.addQuestion(moduleFormGroup); // Add initial question
  }

  addQuestion(moduleFormGroup: FormGroup) {
    const questionFormGroup = new FormGroup({
      question: new FormControl(""),
      response: new FormControl(""),
    });
    (moduleFormGroup.get('content') as FormArray).push(questionFormGroup);
  }

  onContentTypeChange(module: FormGroup | any) {
    if (!module) {
        return; // Exit if module is null
    }

    const contentType = module.get('contentType')?.value; // Use optional chaining
    const contentArray = module.get('content') as FormArray;

    // Clear previous questions if the content type changes
    contentArray.clear();

    if (contentType === 'Questions') {
        this.addQuestion(module); // Add a new question if Questions is selected
    }
    // You can add more conditions for other content types if needed
}

  // Method to submit the form
  onSubmit() {
    console.log(this.newCourseForm.value)
    if (this.newCourseForm.valid) {
      const courseData = this.newCourseForm.value;
      console.log(courseData)
      // Call your API to create a new course
      this.courseService.createCourse(courseData).subscribe({
        next: (response: any) => {
          // Handle successful response
          console.log('Course created successfully:', response);
        },
        error: (error: any) => {
          // Handle error
          console.error('Error creating course:', error);
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }


  get modules(): FormArray {
    return this.newCourseForm.get('modules') as FormArray; // Type assertion here
  }

}
