import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, NgModel, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from './course.service';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { JsonPipe, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

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
    MatIconModule, MatDialogModule,
    NgFor, NgSwitch, NgSwitchCase,FormsModule
  ],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {

  courseService = inject(CourseService);
  fb = inject(NonNullableFormBuilder);
  options = this.courseService.options;
  readonly dialog = inject(MatDialog);
  
  
  
  newCourseForm = this.fb.group({
    name: [''],
    imgUrl: [''],
    modules: this.fb.array([]) // Initialize FormArray for modules
  });

  ngOnInit(): void {
    this.addModule(); 
    this.addPart(0)
  }

  addModule() {
    const moduleFormGroup = this.fb.group({
      title: [''],
      link: [''],
      contentType: ['Type De Contenu'], // Default to first option
      parts: this.fb.array([]),// Initialize parts as FormArray for questione

    });
    this.modules.push(moduleFormGroup);
  }

  addQuestion(moduleIndex: number) {
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(this.fb.group({
      question: [''],
      response: ['']
    }));
  }


  addText(moduleIndex: number){
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push( this.fb.group({
      title: [''],
      content: ['']
    }))
  }

  addVideo(moduleIndex: number){
    const partsArray = this.modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(this.fb.group({
      title: [''],
      description: [''],
      videoUrl: ['']
    }))
  }

  onPartContentTypeChange(moduleIndex: number, partIndex: number) {
    const module = this.modules.at(moduleIndex) as FormArray;
    const part = this.toFormArray(module.get('parts'))?.at(partIndex) as FormGroup;
    const contentType = part.get('contentType')?.value;

    // Clear existing values
    part.get('question')?.setValue('');
    part.get('response')?.setValue('');
    part.get('title')?.setValue('');
    part.get('content')?.setValue('');
    part.get('description')?.setValue('');
    part.get('videoUrl')?.setValue('');

    if (contentType === 'Questions') {
        part.get('question')?.setValidators([Validators.required]);
        part.get('response')?.setValidators([Validators.required]);
    } else if (contentType === 'Text') {
        part.get('title')?.setValidators([Validators.required]);
        part.get('content')?.setValidators([Validators.required]);
    } else if (contentType === 'Video') {
        part.get('title')?.setValidators([Validators.required]);
        part.get('description')?.setValidators([Validators.required]);
        part.get('videoUrl')?.setValidators([Validators.required]);
    }

    part.get('question')?.updateValueAndValidity();
    part.get('response')?.updateValueAndValidity();
    part.get('title')?.updateValueAndValidity();
    part.get('content')?.updateValueAndValidity();
    part.get('description')?.updateValueAndValidity();
    part.get('videoUrl')?.updateValueAndValidity();
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


  addPart(moduleIndex: number) {
    const module = this.modules.at(moduleIndex) as FormArray;
    const partsArray = module.get('parts') as FormArray;

    // Initialize the new part with contentType
    const newPart = this.fb.group({
        contentType: ['Type De Contenu'], // Default content type
        question: [''], // For Questions
        response: [''], // For Questions
        title: [''],    // For Text and Video
        content: [''],  // For Text
        description: [''], // For Video
        videoUrl: [''], // For Video
    });

    partsArray.push(newPart);
}
removePart(moduleIndex: number, partIndex: number) {
  const module = this.modules.at(moduleIndex) as FormArray;
  const partsArray = module.get('parts') as FormArray

  partsArray.removeAt(partIndex)

}

openDialog(moduleIndex: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent);
  dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.removeModule(moduleIndex); // Call removeModule if confirmed
      }
      
  });
}

removeModule(moduleIndex: number) {
  this.modules.removeAt(moduleIndex); // Remove the module from the FormArray
}





}