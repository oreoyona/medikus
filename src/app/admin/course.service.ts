import { HttpClient } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from './create-course/confirm-dialog.component';

export interface ServerDataResponse {
  message: string,
  data?: any
}

export interface CourseData {

  id?: string | number,
  name: string,
  imgUrl: string,
  description: string,
  target: string,
  objectifs: string,
  date: Date,
  courseType: string,
  modules: [],
  registering?: string,
  contact?:string,
  instructor?: string,
  instructorImgUrl?: string


}

export interface Content {

  contentType: string,
  content?: string,
  videoUrl?: string,
  description?: string,
  title?: string,
  question?: string,
  responses?: string
}
export interface ModuleData {
  title: string,
  contentType: string,
  link: string,
  content?: Content,
  parts: Content[]
}
// Enum for Content Types
export enum ContentType {
  Text = 'Text',
  Questions = 'Questions',
  Videos = 'Videos'
}

// Part Interface (Common properties for all content types)
export interface Part {
  type: ContentType; // Add a 'type' property to distinguish parts
}

// Interfaces for specific Part types (extend the Part interface)
export interface TextPart extends Part {
  type: ContentType.Text;
  content: string;
}

export interface QuestionPart extends Part {
  type: ContentType.Questions;
  question: string;
  response: string;
}

export interface VideoPart extends Part {
  type: ContentType.Videos;
  videoUrl: string;
}



@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private addUrl = 'http://localhost:5000/api/v1/courses/add';
  private apiUrl = 'http://localhost:5000/api/v1/courses/';
  options = ['Questions', 'Text', 'Video']
  typeOptions = ['Présentiel', 'En Ligne', 'Hybride']
  readonly dialog = inject(MatDialog);

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private fb: NonNullableFormBuilder) { }

  /**
    * navigate to a particular section of the page.
    * @param the id of the section to navigate to.
    * @returns Void
    */
  goToSection(id: string) {
    this.router.navigate([], { relativeTo: this.route, fragment: id, queryParamsHandling: 'merge' })
  }

  enableForFiveSeconds(prop: WritableSignal<boolean>) {
    setTimeout(() => { prop.set(true) }, 5000)
  }

  /**
   * Create a new course.
   * @param courseData The data for the new course.
   * @returns An observable with the response from the API.
   */
  createCourse(courseData: any): Observable<any> {
    return this.http.post<any>(this.addUrl, courseData);
  }

  /**
   * Get all courses.
   * @returns An observable with the list of courses.
   */
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Get a specific course by ID.
   * @param courseId The ID of the course to retrieve.
   * @returns An observable with the course data.
   */
  getCourseById(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${courseId}`);
  }

  /**
   * Update an existing course.
   * @param courseId The ID of the course to update.
   * @param courseData The updated course data.
   * @returns An observable with the response from the API.
   */
  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${courseId}`, courseData);
  }

  /**
   * Delete a course by ID.
   * @param courseId The ID of the course to delete.
   * @returns An observable with the response from the API.
   */
  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${courseId}`);
  }


  /**
   * Adds a new module to a course
   * @param modules the existing course modules array
   */
  addModule(modules: FormArray<any>) {
    const moduleFormGroup = this.fb.group({
      title: [''],
      link: [''],
      contentType: ['Type De Contenu'], // Default to first option
      parts: this.fb.array([]),// Initialize parts as FormArray for questione

    });
    modules.push(moduleFormGroup);
  }





  addQuestion(modules: FormArray<any>, moduleIndex: number) {
    const partsArray = modules.at(moduleIndex).get('parts') as FormArray;
    partsArray.push(this.fb.group({
      question: [''],
      response: ['']
    }));
  }



  /**
   * Bypasses typescript type assertion by 
   * returning a control as a FormArray
   * @param control the control to transform
   * @returns the control as a FormArray
   */
  toFormArray(control: any) {
    return control as FormArray
  }

  /**
   * Sets contents depending on its type
   * @param modules the modules of the course
   * @param moduleIndex the index of the module in which the content will be added
   * @param partIndex the index of the part of the module in which the content will  be added
   */
  onPartContentTypeChange(modules: FormArray<any>, moduleIndex: number, partIndex: number) {

    const module = modules.at(moduleIndex) as FormArray;
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


  /**
   * 
   * @param modules the modules of the course. We will use it to access
   * a certain module by its index and add to it a new part
   * @param moduleIndex the index of the module in which we want to insert new data
   */
  addPart(modules: FormArray<any>, moduleIndex: number) {
    const module = modules.at(moduleIndex) as FormArray;
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

  /**
   * Removes a part from a module
   * @param modules the course modules
   * @param moduleIndex the index of the module from which we want to remove a part
   * @param partIndex the index of the part to remove
   */
  removePart(modules: FormArray<any>, moduleIndex: number, partIndex: number) {
    const module = modules.at(moduleIndex) as FormArray;
    const partsArray = module.get('parts') as FormArray

    partsArray.removeAt(partIndex)

  }

  /**
   * Removes a module from the course modules array
   * @param modules the course modules
   * @param index the index of the module we want to remove from the modules array
   */
  removeModule(modules: FormArray<any>, index: number) {
    modules.removeAt(index);
  }

  /**
   * Opens a confirmatory dialog for the deletion of a module from the course modules array
   * @param modules the course modules array
   * @param moduleIndex the index of the course we want to confirm deletion
   */
  openDialog(modules: FormArray<any>, moduleIndex: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeModule(modules, moduleIndex); // Call removeModule if confirmed
      }

    });
  }





}

