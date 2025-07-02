import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, from, map, Observable, of, Subject, switchMap, tap, throwError } from 'rxjs';
import { ConfirmDialogComponent } from './create-course/confirm-dialog.component';
import { NgxIndexedDBService, DBConfig } from 'ngx-indexed-db';
import { addUrl, apiUrl } from '../urls';

export interface ServerDataResponse {
  message: string,
  data?: any
}

export type courseType = "Présentiel" | "En Ligne" | "Hybride"

export interface CourseSubscriptionData{
  message: number | string,
  data: number[],
  courses: CourseData[]
}

export interface CourseData {

  id?: string | number,
  name: string,
  imgUrl: string,
  description: string,
  target: string,
  objectifs: string,
  date: Date,
  courseType: string | courseType,
  modules: Array<any>,
  registering?: string,
  contact?: string,
  instructor?: string,
  instructorImgUrl?: string,
  progression_info?: string | number,
  endDate?: Date,
  /**a string containing the dates of an practical course  */
  dates?: string 


}

export interface UserProgress {
  userId: number
  courseId: number;
  completedModules: number[]; // Indices des modules complétés
  completedParts: { [moduleId: number]: number[] }; // Indices des parties complétées par module
  progression_info?: any
}

export interface Content {

  contentType: string,
  content?: string,
  videoUrl?: string,
  description?: string,
  title?: string,
  titre?: string
  question?: string,
  responses?: string,
  response?: string
}

export interface QuestionWithChoices {
  question: string;
  choices: string[];
  correctAnswer: string;
  userAnswer: string | null;
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

  options = ['Questions', 'Text', 'Video']
  typeOptions = ['Présentiel', 'En Ligne', 'Hybride']
  readonly dialog = inject(MatDialog);
  //indexDb configurations

  private objectStoreName = 'userProgress'; // Conservez le nom du magasin d'objets


  //

  ///proprieties for one user course tracking
  private userProgress: boolean[] = [];
  private totalModules: number = 0;
  private totalParts: number = 0;
  private courseId: number = 0;

  /**queued updates (BehaviorSubject to trigger updates) **/
  private progressUpdates$ = new Subject<{ userId: number; courseId: number; progress: number; }>();

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private fb: NonNullableFormBuilder, private dbService: NgxIndexedDBService) {
    this.progressUpdates$.pipe(
      debounceTime(1000), // 1000ms = 1s)
      switchMap(update => {
        // Send the update to the backend
        return this.updateBackendProgress(update.courseId, update.progress).pipe(
          catchError(error => {
            console.error('Error updating backend progress:', error);
            return throwError(() => error); // Re-throw the error
          })
        );
      })
    ).subscribe({
      next: () => {
        //do something with the results
      },
      error: (error) => console.error('Error sending progress update:', error)
    });
  }


  /**
   * Calculates the overall progress of a course.
   * @param course The course data.
   * @param userProgress The user's progress data.
   * @returns The progress percentage as a number.
   */
  calculateCourseProgression(course: any, userProgress: UserProgress): number {
    if (!course || !course.modules || course.modules.length === 0) {
      return 0;
    }

    const totalModules = course.modules.length;
    let totalParts = 0;
    let completedPartsCount = 0;

    for (let i = 0; i < totalModules; i++) {
      const module = course.modules[i];
      const partsCount = module.parts ? module.parts.length : 0;
      totalParts += partsCount;

      if (userProgress && userProgress.completedParts && userProgress.completedParts[i]) {
        completedPartsCount += userProgress.completedParts[i].length;
      }
    }

    let progression = 0;

    if (totalModules > 0) {
      const moduleCompletionPercentage = (userProgress && userProgress.completedModules ? userProgress.completedModules.length : 0) / totalModules;
      progression += moduleCompletionPercentage * 50;
    }

    if (totalParts > 0) {
      const partsCompletionPercentage = completedPartsCount / totalParts;
      progression += partsCompletionPercentage * 50;
    }

    return Math.round(progression);
  }

  /**
   * Retrieves the user's progress from IndexedDB.
   * @param userId The ID of the user.
   * @param courseId The ID of the course.
   * @returns An Observable of the user's progress.
   */
  getUserProgress(userId: number, courseId: number): Observable<UserProgress | null> {
    return from(this.dbService.getByKey('userProgress', [userId, courseId])).pipe(
      map(result => result as UserProgress || null)
    );
  }
  /**
   * Saves the user's progress to IndexedDB.
   * @param userProgress The user's progress data.
   * @returns An Observable of the saved progress.
   */
  saveUserProgress(userProgress: UserProgress): Observable<UserProgress> {
    return from(this.dbService.update(this.objectStoreName, userProgress)).pipe(
      map(result => result as UserProgress)
    );
  }

  /**
   * Creates or updates the user's progress in IndexedDB.
   * @param userProgress The user's progress data.
   * @returns An Observable of the saved progress.
   */
  createOrUpdateUserProgress(userProgress: UserProgress): Observable<UserProgress> {
    return this.getUserProgress(userProgress.userId, userProgress.courseId)
    .pipe(
      catchError(error => {
        console.error('Error getting user progress:', error);
        return throwError(() => error); // Propagate the error
      }),
      switchMap(existingProgress => {
       
        if (existingProgress) {
          return from(this.dbService.update('userProgress', userProgress)).pipe(
            catchError(error => {
              console.error('Error updating user progress:', error);
              return throwError(() => error); // Propagate the error
            })
          );
        } else {
          console.log("Not existing records was found")
          return from(this.dbService.add('userProgress', userProgress)).pipe(
            
            catchError(error => {
              console.error('Error adding user progress:', error);
              return throwError(() => error); // Propagate the error
            })
          );
        }
      }),
      map(result => result as UserProgress),
      catchError(error => {
        console.error('Final error in createOrUpdateUserProgress:', error);
        return throwError(() => error); // Propagate the error
      })
    );
  }

 
  /**
   * Deletes a user's progress record for a specific course from IndexedDB.
   *
   * @param userId The ID of the user.
   * @param courseId The ID of the course.
   * @returns An Observable that completes when the record is deleted, or emits an error.
   *
   * @example
   * ```typescript
   * this.courseService.deleteUserRecordsFromIndexDb(123, 456).subscribe({
   * next: () => {
   * console.log('User progress record deleted successfully.');
   * },
   * error: (error) => {
   * console.error('Failed to delete user progress record:', error);
   * }
   * });
   * ```
   */
  deleteUserRecordsFromIndexDb(userId: number, courseId: number): Observable<void> {
    const key = [userId, courseId];
    return from(this.dbService.delete('userProgress', key)).pipe(
      map(() => {
        // Optionally, you can perform additional actions after deletion here.
      }),
      catchError(error => {
        console.error('Error deleting user record from IndexedDB:', error);
        return throwError(() => error); // Propagate the error
      })
    );
  }


  /**
   *
   * @param userId
   * @param courseId
   * @param moduleId
   * @param userProgress
   * @returns
   */
  markModuleCompleted(userId: number, courseId: number, moduleId: number, userProgress: UserProgress): Observable<UserProgress> {
    if (!userProgress.completedModules.includes(moduleId)) {
      userProgress.completedModules.push(moduleId);
    }
    return this.updateProgressAndSave(userId, courseId, userProgress); // Use combined update and save
  }
  /**
   * Marks a given course as completed
   * @param courseId the id of the course to mark as completed
   * @returns an observable of the server response
   */
  markCourseAsCompleted(courseId: number) {
    return this.http.put(`${apiUrl}${courseId}/completed`, {})
  }

  /**
     * navigate to a particular section of the page.
     * @param the id of the section to navigate to.
     * @returns Void
     */
  goToSection(id: string) {
    this.router.navigate([], { relativeTo: this.route, fragment: id, queryParamsHandling: 'merge' })
  }

 
  /**
   * Create a new course.
   * @param courseData The data for the new course.
   * @returns An observable with the response from the API.
   */
  createCourse(courseData: any): Observable<any> {
    return this.http.post<any>(addUrl, courseData);
  }

  /**
   * Get all courses.
   * @returns An observable with the list of courses.
   */
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(apiUrl);
  }


  /**
   * Get all the courses corresponding to the search term
   * @param searchTerm
   */
  getCourseBySearchTerm(searchTerm: string): Observable<any> {
    return this.http.post(`${apiUrl}search`, { 'term': searchTerm });
  }

  /**
   * Get a specific course by ID.
   * @param courseId The ID of the course to retrieve.
   * @returns An observable with the course data.
   */
  getCourseById(courseId: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}${courseId}`);
  }


  /**
     * Retrieves a list of completed courses, optionally filtered by a time limit.
     *
     * This method makes an HTTP GET request to the backend API to fetch completed courses.
     * The `limiter` parameter, if provided, specifies a time limit (e.g., number of days) within which
     * the courses should have been completed. If `limiter` is not provided, it retrieves all completed courses.
     *  The 'role' parameter defaults to 'admin' but can be overridden.
     *
     * @param {number} [limiter] - The optional time limit in days (e.g., number of days) to filter completed courses.
     * @param {string[]} [roles] - Optional array of roles to send to the server. Defaults to ['admin'].
     * @returns {Observable<any>} An Observable that emits the HTTP response containing the completed courses data.
     *
     * @example
     * // Retrieve all completed courses as admin:
     * this.courseService.getCompletedCourses().subscribe(
     * (response) => {
     * console.log('Completed courses:', response);
     * },
     * (error) => {
     * console.error('Error retrieving completed courses:', error);
     * }
     * );
     *
     * @example
     * // Retrieve completed courses within the last 30 days as admin:
     * this.courseService.getCompletedCourses(30).subscribe(
     * (response) => {
     * console.log('Completed courses (last 30 days):', response);
     * },
     * (error) => {
     * console.error('Error retrieving completed courses (last 30 days):', error);
     * }
     * );
     *
     * @example
     * // Retrieve all completed courses as a user:
     * this.courseService.getCompletedCourses(undefined, ['user']).subscribe(
     * (response) => {
     * console.log('Completed courses (as user):', response);
     * },
     * (error) => {
     * console.error('Error retrieving completed courses (as user):', error);
     * }
     * );
     *
     * @example
     * // Retrieve completed courses within the last 30 days as both admin and user:
     * this.courseService.getCompletedCourses(30, ['admin', 'user']).subscribe(
     * (response) => {
     * console.log('Completed courses (last 30 days, admin and user):', response);
     * },
     * (error) => {
     * console.error('Error retrieving completed courses (last 30 days, admin and user):', error);
     * }
     * );
     */
  getCompletedCourses(limiter?: number, roles: string[] = ['admin']): Observable<any> {
    let params = new HttpParams();

    // Add roles to the parameters
    roles.forEach(role => {
      params = params.append('role', role);
    });

    let url = apiUrl + 'completed'; // Base URL

    if (limiter !== undefined) {
      url += `/${limiter}`; // Append limiter if provided
    }

    return this.http.get(url, { params: params });
  }
  



  /** Imite la fonction getCompletedCourses pour les utilisateurs qui n'ont pas d'acces admin */
  getUserCompletedCourses() {
    return this.http.post(`${apiUrl}completed`, { 'role': 'user' })
  }

  /**
     * Retrieves a list of certificates, optionally filtered by a time limit or quantity limit.
     *
     * This method makes an HTTP GET request to the backend API to fetch certificates.
     * The `limiter` parameter, if provided, specifies a time limit or quantity limit
     * (e.g., number of days or maximum number of certificates) to filter the results.
     * If `limiter` is not provided, it retrieves all certificates.
     *
     * @param {number} [limiter] - The optional time limit or quantity limit to filter certificates.
     * @returns {Observable<any>} An Observable that emits the HTTP response containing the certificates data.
     *
     * @example
     * // Retrieve all certificates:
     * this.certificateService.getAllCertificates().subscribe(
     * (response) => {
     * console.log('Certificates:', response);
     * },
     * (error) => {
     * console.error('Error retrieving certificates:', error);
     * }
     * );
     *
     * @example
     * // Retrieve certificates limited to the last 30 days or the first 30 certificates:
     * this.certificateService.getAllCertificates(30).subscribe(
     * (response) => {
     * console.log('Certificates (limited):', response);
     * },
     * (error) => {
     * console.error('Error retrieving limited certificates:', error);
     * }
     * );
     */
  getAllCertificates(limiter?: number): Observable<any> {
    const url = limiter !== undefined ? `${apiUrl}certificates/${limiter}` : `${apiUrl}certificates`;
    return this.http.get(url);
  }


  /**
   * Update an existing course.
   * @param courseId The ID of the course to update.
   * @param courseData The updated course data.
   * @returns An observable with the response from the API.
   */
  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http.put<any>(`${apiUrl}${courseId}`, courseData);
  }

  /**
   * Delete a course by ID.
   * @param courseId The ID of the course to delete.
   * @returns An observable with the response from the API.
   */
  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete<any>(`${apiUrl}${courseId}`);
  }

  /**
   *
   * @param courseId the course Id of the course the  user wants to be subscribed to
   * @returns An observable containing the server response
   */
  subscribeToCourse(courseId: number) {
    return this.http.post(`${apiUrl}subscribe/${courseId}`, {})
  }


  /**
   * @param courseId the course Id of the course the user intends to be unsubscribed from
   * @returns An pobservable of the server response
   */

  unsubscribe(courseId: number) {
    return this.http.delete(`${apiUrl}unsubscribe/${courseId}`)
  }

  /**
   * @param userId: the user Id
   * @returns An observable of the servver response
   */
  getUserSubscriptions(userId: number) {
    return this.http.get<CourseSubscriptionData>(`${apiUrl}subscriptions/${userId}`)
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


  /**
   * Initializes the course progress tracking for a newly created course.
   *
   * This method calculates the total number of modules and parts in the course,
   * stores them in the service's state, and initializes an array to track the
   * completion status of each part.
   *
   * @param modules An array representing the modules in the course. Each module
   * should have a 'parts' property, which is an array of parts.
   * @param courseId The unique identifier of the course.
   */
  initializeCourseProgress(modules: any[], courseId: number): void {
    this.courseId = courseId;
    this.totalModules = modules.length;

    // Calculate the total number of parts across all modules
    this.totalParts = modules.reduce((total, module) => total + module.parts.length, 0);

    // Initialize an array to track the completion status of each part.
    // Initially, all parts are marked as not completed (false).
    this.userProgress = new Array(this.totalParts).fill(false);
  }

  /**
   * Marks a specific part of the course as completed.
   *
   * This method updates the user's progress array to indicate that the specified
   * part has been completed. It then triggers an update to the backend to
   * persist the overall course progress.
   * @param userId the id of the user
   * @param courseId The id of the course
   * @param moduleId the id of the currnet module
   * @param partIndex The index of the part that has been completed.
   * @param userProgress the userProgress object
   */
  markPartCompleted(userId: number, courseId: number, moduleId: number, partId: number, userProgress: UserProgress): Observable<UserProgress> {
    if (!userProgress.completedParts[moduleId]) {
      userProgress.completedParts[moduleId] = [];
    }
    if (!userProgress.completedParts[moduleId].includes(partId)) {
      userProgress.completedParts[moduleId].push(partId);
    }
    
    return this.updateProgressAndSave(userId, courseId, userProgress); // legacy. Try this if the current return does not work

    // return this.updateProgressLocallyAndQueueBackendUpdate(userId, courseId, userProgress);


  }
  /**
   * Combines updating progress locally, saving to IndexedDB, and queueing a backend update.
   */
  private updateProgressLocallyAndQueueBackendUpdate(userId: number, courseId: number, userProgress: UserProgress): Observable<UserProgress> {
    return this.getCourseById(courseId).pipe(
      switchMap(courseData => {
         //the server sends an object of the type {data: Array, message: string}
        const progressPercentage = this.calculateCourseProgression(courseData.data, userProgress);
        userProgress.progression_info = progressPercentage;

        return this.createOrUpdateUserProgress(userProgress).pipe(
          tap(() => {
            // Queue the backend update
            this.queueBackendUpdate(userId, courseId, progressPercentage);
          })
        );
      })
    );
  }

  /**
   * Queues a progress update to be sent to the backend later.
   */
  private queueBackendUpdate(userId: number, courseId: number, progress: number): void {
    this.progressUpdates$.next({ userId, courseId, progress });
  }



  /**
   * Calculates the overall progress percentage of the course.
   *
   * This method determines the percentage of course parts that have been completed
   * by the user. It counts the number of completed parts and divides it by the
   * total number of parts.
   *
   * @returns The overall progress percentage as a number.
   */
  calculateProgressPercentage(course: any, userProgress: UserProgress): number {
    if (!course || !course.modules || course.modules.length === 0) {
      return 0;
    }

    const totalModules = course.modules.length;
    let totalParts = 0;
    let completedPartsCount = 0;

    for (let i = 0; i < totalModules; i++) {
      const module = course.modules[i];
      const partsCount = module.parts ? module.parts.length : 0;
      totalParts += partsCount;

      if (userProgress && userProgress.completedParts && userProgress.completedParts[i]) {
        completedPartsCount += userProgress.completedParts[i].length;
      }
    }

    let progression = 0;

    if (totalModules > 0) {
      const moduleCompletionPercentage = (userProgress && userProgress.completedModules ? userProgress.completedModules.length : 0) / totalModules;
      progression += moduleCompletionPercentage * 50;
    }

    if (totalParts > 0) {
      const partsCompletionPercentage = completedPartsCount / totalParts;
      progression += partsCompletionPercentage * 50;
    }

    return Math.round(progression);
  }

  /**
   * Updates the backend with the user's current course progress.
   *
   * This method calculates the current progress percentage and sends a PUT request
   * to the backend API to update the `UserCourseCompletion` record.
   *
   * @returns An Observable representing the HTTP PUT request.
   */
  updateBackendProgress(courseId: number, progress: number, userProgress?: UserProgress): Observable<any> {
    // Send a PUT request to the backend API to update the progress.
    return this.http.put(`${apiUrl}${courseId}/progress`, { progress, userProgress })
    .pipe(
      catchError( error => {
        console.error('Error updating backend progress:', error);
        return throwError(()=> error)
      })
    )
  }

  /**
   * Combines updating progress locally and saving to the backend.
   * @param userId The ID of the user.
   * @param courseId The ID of the course.
   * @param userProgress The user's progress data.
   * @returns An Observable of the updated user progress.
   */
  private updateProgressAndSave(userId: number, courseId: number, userProgress: UserProgress): Observable<UserProgress> {
    return this.getCourseById(courseId).pipe( // Fetch course data to calculate progression
      switchMap(courseData => {
        const progressPercentage = this.calculateCourseProgression(courseData.data, userProgress); // returns the user progression in percentage
        userProgress.progression_info = progressPercentage; // Update the userProgress object

        return this.createOrUpdateUserProgress(userProgress).pipe( // Save to IndexedDB
          tap(() => { // Use tap for side effect
            this.updateBackendProgress(courseId, progressPercentage, userProgress).subscribe({ // Save to backend
              next: (response) => {},
              error: (error) => console.error('Error updating server progress:', error)
            });
          })
        );
      })
    );
  }

  /**
   * 
   * @param key an array containg the userId and the courseID
   * @returns An observable of the operation in the local
   * database
   * @example 
   * ```
   * 
   * let userId = 29;
   * let courseId = 2132
   * let keyPath = [userId, courseId]
   * getDataIndexDbByKey(keyPath).subscribe(res => console.log(res))
   * output : {
        * userId: 29, 
        * courseId: 2132, 
        * completedModules: Array(4), 
        * completedParts: {…}, 
        * progression_info: 100
        * }

   * ```
   
   */
  getDataInIndexDbByKey(key: Array<number>){
    return this.dbService.getByKey('userProgress', key)
  }
}

