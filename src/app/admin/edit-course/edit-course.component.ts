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
import { ConfirmDialogComponent } from '../create-course/confirm-dialog.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../auth/auth.service';
import { DeleteDialogComponent } from './delete-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, take, timer } from 'rxjs';

@Component({
  selector: 'app-edit-course',
  imports: [
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
  courseId!: any
  router= inject(Router)
  options = this.courseService.options
  typeOptions = this.courseService.typeOptions
  readonly dialog = inject(MatDialog)
  errorInEditing = signal(false)
  edited = signal(false)
  cd = inject(ChangeDetectorRef)
  editCourseForm: FormGroup<any>

  route = inject(ActivatedRoute)

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
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        // Nothing here yet
      }
    });
  
    this.courseService.getCourseById(this.courseId)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.router.navigateByUrl("/catalogue");
            return of(null);
          }
          console.error('An error occurred:', error);
          return of(null);
        })
      )
      .subscribe((response: ServerDataResponse) => {
        if (response) {
          const course: CourseData = response.data;
  
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
  
          const modulesArray = this.editCourseForm.get('modules') as FormArray;
  
          course.modules.forEach((module: ModuleData) => {
            const newModule = this.fb.group({
              title: [module.title],
              link: [module.link],
              contentType: ['Type De Contenu'], // Default to first option
              parts: this.fb.array([]) // Initialize parts as an empty FormArray
            });
  
            // Populate parts correctly
            if (Array.isArray(module.content)) { // Check if module.content is an array
              module.content.forEach((part: any) => {
                (newModule.get('parts') as FormArray).push(this.fb.group({
                  "contentType": part.contentType,
                  "content": part.content,
                  "videoUrl": part.videoUrl || "",
                  "description": part.description || "",
                  "title": part.title || "",
                  "question": part.question || "",
                  "response": part.response || ""
                }));
              });
            }
  
            modulesArray.push(newModule);
          });
        }
      });
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
          this.edited.set(true);
          this.errorInEditing.set(false);
          this.startTimer();

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })

        }
        else{
          this.edited.set(false);
          this.errorInEditing.set(true);
          this.startTimer();
        }
      }, ()=>{
        this.edited.set(false);
        this.errorInEditing.set(true);
        this.startTimer();
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

      this.router.navigateByUrl("/catalogue")
    })

  }


  startTimer() {
    timer(20000).pipe(take(1)).subscribe(() => {
        this.edited.set(false);
        this.errorInEditing.set(false);
    });
}



}
