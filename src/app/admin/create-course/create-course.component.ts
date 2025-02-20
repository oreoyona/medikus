import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, NgForm, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from './course.service';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';

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
    NgFor, NgSwitch, NgSwitchCase,FormsModule 
  ],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {
  courseService = inject(CourseService);
  options = this.courseService.options;

  newCourseForm = new FormGroup({
    name: new FormControl(''),
    imgUrl: new FormControl(''),
    modules: new FormArray([]) // Initialize FormArray for modules
  });

  ngOnInit(): void {
    this.addModule(); // Start with one module
  }

  addModule() {
    const moduleFormGroup = new FormGroup({
      title: new FormControl(''),
      link: new FormControl(''),
      contentType: new FormControl("None", Validators.required), // Default to first option
      parts: new FormArray([]) // Initialize parts as FormArray for questions
    });
    this.modules.push(moduleFormGroup);
  }

  addQuestion(moduleIndex: number) {
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(new FormGroup({
      question: new FormControl(''),
      response: new FormControl('')
    }));
  }


  addText(moduleIndex: number){
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(new FormGroup({
      title: new FormControl(""),
      content: new FormControl("")
    }))
  }

  addVideo(moduleIndex: number){
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(new FormGroup({
      title: new FormControl(""),
      description: new FormControl(""),
      videoUrl: new FormControl("")
    }))
  }

  onContentTypeChange(moduleIndex: number) {
    const module = this.modules.at(moduleIndex) as FormGroup;
    const contentType = module.get('contentType')?.value;
    const parts = module.get('parts') as FormArray;

    parts.clear(); // Clear any existing parts
    if (contentType === 'Questions') {
      this.addQuestion(moduleIndex); // Add an initial question
    }

    else if(contentType === 'Text'){
      this.addText(moduleIndex)
    }

    else{
      this.addVideo(moduleIndex)
    }
  }

  onSubmit() {
    if (this.newCourseForm.valid) {
      console.log(this.newCourseForm.value);
      // Call the API to create a new course
      this.courseService.createCourse(this.newCourseForm.value).subscribe({
        next: (response) => console.log('Course created successfully:', response),
        error: (error) => console.error('Error creating course:', error)
      });
    } else {
      console.error('Form is invalid');
    }
  }

  get modules(): FormArray {
    return this.newCourseForm.get('modules') as FormArray; // Access the FormArray
  }

  toFormArray(control: any){
    return control as FormArray
  }

  newPartType: string = 'Questions'; // Default part type

addPart(moduleIndex: number) {
    const module = this.modules.at(moduleIndex) as FormGroup;
    const partsArray = module.get('parts') as FormArray;

    if (this.newPartType === 'Questions') {
        partsArray.push(new FormGroup({
            contentType: new FormControl(this.newPartType),
            question: new FormControl(''),
            response: new FormControl('')
        }));
    } else if (this.newPartType === 'Text') {
        partsArray.push(new FormGroup({
            contentType: new FormControl(this.newPartType),
            title: new FormControl(''),
            content: new FormControl('')
        }));
    } else if (this.newPartType === 'Video') {
        partsArray.push(new FormGroup({
            contentType: new FormControl(this.newPartType),
            title: new FormControl(''),
            description: new FormControl(''),
            videoUrl: new FormControl('')
        }));
    }
}
}