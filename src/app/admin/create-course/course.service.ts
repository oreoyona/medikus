import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';


// Course Interface
export interface Course {
  title: string;
  imgUrl: string;
  modules: Module[];
}

// Module Interface
export interface Module {
  title: string;
  contentType: ContentType;
  parts: Part[];
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
  private apiUrl = 'http://localhost:5000/api/v1/courses';  // Adjust the URL as needed
  options = ['Questions', 'Text', 'Video']
  typeOptions = ['Présentiel', 'En Ligne', 'Hybride']
  constructor(private http: HttpClient) {}


  /**
   * Create a new course.
   * @param courseData The data for the new course.
   * @returns An observable with the response from the API.
   */
  createCourse(courseData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, courseData);
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
    return this.http.get<any>(`${this.apiUrl}/${courseId}`);
  }

  /**
   * Update an existing course.
   * @param courseId The ID of the course to update.
   * @param courseData The updated course data.
   * @returns An observable with the response from the API.
   */
  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${courseId}`, courseData);
  }

  /**
   * Delete a course by ID.
   * @param courseId The ID of the course to delete.
   * @returns An observable with the response from the API.
   */
  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${courseId}`);
  }

 /**
  * Add a Text Part to a Course Module
  * @param the course module to which the part will be added
  * @param the part to add
  */

 addpartToModule(module: FormArray, part: FormGroup){
  module.push(part)
 }

 

}

