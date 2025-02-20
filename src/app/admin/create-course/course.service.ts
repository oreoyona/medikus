import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:5000/api/v1/courses';  // Adjust the URL as needed
  options = ['Questions', 'Text', 'Video']
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



}

