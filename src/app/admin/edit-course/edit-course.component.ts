import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseData, CourseService, ModuleData, ServerDataResponse } from '../course.service';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CkeditorComponent } from '../../ckeditor/ckeditor.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { HeaderComponent } from '../../common/header/header.component';
import { ConfirmDialogComponent } from '../create-course/confirm-dialog.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../auth/auth.service';
import { DeleteDialogComponent } from './delete-dialog.component';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-edit-course',
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
    CkeditorComponent],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.scss',
  standalone: true,
  providers: [provideNativeDateAdapter()]
})
export class EditCourseComponent implements OnInit {

  //component proprierties

  courseService = inject(CourseService)
  authService = inject(AuthService)
  courseId!: number
  route = inject(Router)
  options = this.courseService.options
  typeOptions = this.courseService.typeOptions
  readonly dialog = inject(MatDialog)
  errorInEditing = signal(false)
  edited = signal(false)
  cd = inject(ChangeDetectorRef)
  editCourseForm: FormGroup<any>

  constructor(private fb: FormBuilder) {

    //form initialization

    this.editCourseForm = this.fb.group({
      name: ['', Validators.required],
      imgUrl: ['', Validators.required],
      description: ['', Validators.required],
      objectifs: ['', Validators.required],
      target: [''],
      date: [''],
      courseType: [''],
      instructor: [''],
      instructorImgUrl: [''],
      contact: [''],
      registering: [''],
      modules: this.fb.array([])
    });
  }
  ngOnInit(): void {
    //get the id of the page which is the last digit of the url
    this.courseId = Number(this.authService.getLastUrlStr());

    //Make an api call to get the course from the db 
    this.courseService.getCourseById(this.courseId).pipe(

      catchError((error) => {
        // Handle the 404 error
        if (error.status === 404) {
          this.route.navigateByUrl("/catalogue");
          return of(null); // Return a null observable to complete the stream
        }
        // Handle other errors if necessary
        console.error('An error occurred:', error);
        return of(null); // Return a null observable for other errors as well
      }
      )
    ).subscribe((response: ServerDataResponse) => {

      if (response) {
        const course: CourseData = response.data



        // Populate the form controls
        this.editCourseForm.patchValue({
          name: course.name,
          imgUrl: course.imgUrl,
          description: course.description,
          objectifs: course.objectifs,
          target: course.target,
          date: new Date(course.date),
          courseType: course.courseType,
          contact: course.contact,
          instructor: course.instructor,
          instructorImgUrl: course.instructorImgUrl,
          registering: course.registering
        });

        //populate the modules

        const modulesArray = this.editCourseForm.get('modules') as FormArray

        course.modules.forEach((module: ModuleData) => {
          const newModule = this.fb.group({
            title: [module.title],
            link: [module.link],
            contentType: ['Type De Contenu'], // Default to first option
            parts: this.fb.array([this.fb.group({
              "contentType": module.content?.contentType,
              "content": module.content?.content,
              "videoUrl": module.content?.videoUrl || "",
              "description": module.content?.description || "",
              "title": module.content?.title || "",
              "question": module.content?.question || "",
              "response": module.content?.responses || ""
            })]),
          })


          modulesArray.push(newModule)
        })

      }
    })



  }




  addModule() {
    this.courseService.addModule(this.modules)
  }


  onPartContentTypeChange(moduleIndex: number, partIndex: number) {
    this.courseService.onPartContentTypeChange(this.modules, moduleIndex, partIndex)
  }

  onSubmit() {

    if (this.editCourseForm.valid) {
      // Call the API to create a new course
      this.courseService.updateCourse(this.courseId, this.editCourseForm.value).subscribe((res: any) => {
        if (res.message == 200) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })

        }
      })
    }


  }

  get modules(): FormArray {
    return this.editCourseForm.get('modules') as FormArray; // Access the FormArray
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

  deleteCourse() {
    const dialogRef = this.dialog.open(DeleteDialogComponent);
    dialogRef.afterClosed().subscribe(() => {

      this.route.navigateByUrl("/catalogue")
    })

  }



}
