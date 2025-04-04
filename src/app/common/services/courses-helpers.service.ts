import { Injectable } from '@angular/core';
import { CourseService, UserProgress } from '../../admin/course.service';
import { User } from '../infercaces';

@Injectable({
  providedIn: 'root'
})
export class CoursesHelpersService {

  constructor(private courseService:CourseService) { }

  /**
     * checks if the current course has been marked as completed in the database
     * And updates the local database accordingly
     * As well as the UI
     */
    checkAndUpdateCourseCompletion(currentUser: User, courseId: number){
      console.info("Checking course completions")
      this.courseService.getCompletedCourses(undefined, ['user'])
      .subscribe((res: any) => {
  
        //the server sends an object of type  {'message': Object, 'data': CoursesObject}
        const completedCourses = res.data as Array<any>
        //check if the current course is completed
        completedCourses.forEach((course)=>{
          //each course has this structure { 'course_id': number, 'course_name": string, 'completed_at': Date }
          if(course.course_id == courseId){
            //update the localStorage by creating a userProgress object with the course's data
  
            const userProgress: UserProgress = {
              userId: currentUser?.id as number,
              courseId: courseId,
              completedModules: course.completed_modules,
              completedParts: course.completedParts
            }
            
            this.courseService.createOrUpdateUserProgress(userProgress)
            .subscribe({
              next: () => {console.log("IndexDB updated")},
              error: (err) => {console.log(err)},
              complete: ()=> {}
            })
          }
        })
      })
    }
  
}
