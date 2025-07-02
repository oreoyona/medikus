import { Injectable } from '@angular/core';
import { CourseData, CourseService, UserProgress } from '../../admin/course.service';
import { User } from '../infercaces';

export interface QuestionsObject{
  question: string,
  answer: string
}

@Injectable({
  providedIn: 'root'
})
export class CoursesHelpersService {

  constructor(private courseService: CourseService) { }


  /**
 * Transforms question and answer strings into a structured array of objects.
 *
 * @param questionsString - A string containing questions separated by a delimiter (e.g., ';').
 * @param answersString - A string containing answers separated by the same delimiter.
 * @param delimiter - The delimiter used to separate questions and answers in the strings.  Defaults to ';'.
 * @returns An array of objects, where each object represents a question-answer pair.
 * Returns an empty array if either input string is empty or if the number of questions
 * and answers don't match.
 */
  transformQuestionAnswerStrings(
    questionsString: string,
    answersString: string,
    delimiter: string = ';'
  ): QuestionsObject[] {
    
    if (!questionsString.trim() || !answersString.trim()) {
      return []; // Return empty array for empty input
    }

    if(!questionsString || !answersString) return []

    const questions: string[] = questionsString.split(delimiter).map(q => q.trim());
    const answers: string[] = answersString.split(delimiter).map(a => a.trim());

    
    if (questions.length !== answers.length) {
      console.warn(
        "Warning: Number of questions and answers do not match.  Returning an empty array."
      );
      return []; // Return empty array for mismatched lengths.  
    }

   
    const result: { question: string; answer: string }[] = [];
    for (let i = 0; i < questions.length; i++) {
      result.push({
        question: questions[i],
        answer: answers[i],
      });
    }
    return result;
  }


  /**
   * Adds a reminder to the user's Google Calendar.
   *
   * @param date The date for the reminder. This will be used as both the start and end time for a simple reminder.
   * @param title The title of the reminder event in Google Calendar. This is a mandatory field.
   * @param details [Optional] Additional details or notes for the reminder event.
   * @param location [Optional] The location associated with the reminder event.
   */
  addToAgenda(date: Date, title: string, details?: string, location?: string) {
    const formattedDate = date.toISOString().replace(/-|:|\.\d+/g, '');
    const startTime = formattedDate; // Use the provided date for start time
    const endTime = formattedDate;   // For a reminder, start and end can be the same

    let googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${startTime}/${endTime}&text=${encodeURIComponent(title)}`;

    if (details) {
      googleCalendarUrl += `&details=${encodeURIComponent(details)}`;
    }

    if (location) {
      googleCalendarUrl += `&location=${encodeURIComponent(location)}`;
    }

    // Open the Google Calendar URL in a new tab
    window.open(googleCalendarUrl, '_blank');
  }


  /**
 * Extracts valid dates from a string with a specific format ("DD/MM/YYYY")
 * separated by semicolons (;).
 *
 * The function parses each part of the input string, validates if it matches
 * the expected date format using a regular expression, and performs a basic
 * check for date validity (year range, month range, and day within the month).
 * Invalid date formats or values are logged as warnings to the console and
 * are not included in the returned array.
 *
 * **Example Usage:**
 * ```typescript
 * const dateString = "25/04/2025; 10/12/2024/;05//01/2026; 30/06/2023;";
 * const datesArray = extractDatesFromString(dateString);
 * console.log(datesArray);
 * // Expected output (order might vary slightly):
 * // [
 * //   Fri Apr 25 2025 00:00:00 GMT+0200 (Central Africa Time),
 * //   Tue Dec 10 2024 00:00:00 GMT+0200 (Central Africa Time),
 * //   Thu Jan 05 2026 00:00:00 GMT+0200 (Central Africa Time),
 * //   Fri Jun 30 2023 00:00:00 GMT+0200 (Central Africa Time)
 * // ]
 * ```
 *
 * @param dateString A string containing dates in the format "DD/MM/YYYY" separated
 * by semicolons (e.g., "25/04/2025; 10/12/2024; 05/01/2026;").
 * Leading/trailing whitespace around each date is ignored.
 * Empty parts resulting from consecutive semicolons or a trailing
 * semicolon are also ignored.
 * @returns An array of JavaScript `Date` objects representing the valid dates
 * extracted from the input string. The time component of these `Date`
 * objects will be set to midnight (00:00:00) in the local timezone.
 */
  extractDatesFromString(dateString: string): Date[] {
    // Split the string by the delimiter ';' and filter out any empty strings
    const dateParts = dateString.split(';').filter(part => part.trim() !== '');
    const extractedDates: Date[] = [];

    for (const part of dateParts) {
      // Trim any leading/trailing whitespace from each part
      const trimmedPart = part.trim();

      // Regular expression to match the "DD/MM/YYYY" format
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = trimmedPart.match(dateRegex);

      if (match) {
        // Extract day, month, and year from the matched groups
        const day = parseInt(match[1], 10);
        // Month is 0-indexed in JavaScript Date, so we subtract 1
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);

        // Basic date validity check
        if (year >= 1000 && year <= 9999 && month >= 0 && month <= 11 && day >= 1 && day <= new Date(year, month + 1, 0).getDate()) {
          // Create a new Date object with the extracted year, month, and day
          extractedDates.push(new Date(year, month, day));
        } else {
          // Log a warning if the date format is correct but the values are invalid
          console.warn(`Invalid date format or value found: "${trimmedPart}"`);
        }
      } else {
        // Log a warning if the part does not match the expected "DD/MM/YYYY" format
        console.warn(`Unexpected date format found: "${trimmedPart}". Expected "DD/MM/YYYY".`);
      }
    }

    // Return the array of extracted and validated Date objects
    return extractedDates;
  }

  /**
   * Adds to google calendar a course
   * @param course - the object from whitch to extract the start and end dates
   */
  addToCalendar(course: CourseData): void {
    if (course?.date) {
      const startDate = new Date(course.date);
      const endDate = course.endDate ? new Date(course.endDate) : (() => {
        const futureDate = new Date(course.date);
        futureDate.setDate(futureDate.getDate() + (4 * 7)); // Add 4 weeks (4 * 7 days)
        return futureDate;
      })();
      const title = course.name;
      const description = course.description;
      const location = 'En ligne';

      // Convert local Date objects to UTC format for Google Calendar
      const getUTCDateString = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      };

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${getUTCDateString(startDate)}/${getUTCDateString(endDate)}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(course.description!)}&location=${encodeURIComponent(location)}`;

      window.open(googleCalendarUrl, '_blank');
    } else {
      console.error('La date du webinaire est manquante.');
      // Optionally show a user-friendly message
    }
  }

  /**
     * checks if the current course has been marked as completed in the database
     * And updates the local database accordingly
     * As well as the UI
     */
  checkAndUpdateCourseCompletion(currentUser: User, courseId: number) {
    console.info("Checking course completions")
    this.courseService.getCompletedCourses(undefined, ['user'])
      .subscribe((res: any) => {

        //the server sends an object of type  {'message': Object, 'data': CoursesObject}
        const completedCourses = res.data as Array<any>
        //check if the current course is completed
        completedCourses.forEach((course) => {
          //each course has this structure { 'course_id': number, 'course_name": string, 'completed_at': Date }
          if (course.course_id == courseId) {
            //update the localStorage by creating a userProgress object with the course's data

            const userProgress: UserProgress = {
              userId: currentUser?.id as number,
              courseId: courseId,
              completedModules: course.completed_modules,
              completedParts: course.completedParts
            }

            this.courseService.createOrUpdateUserProgress(userProgress)
              .subscribe({
                next: () => { console.log("IndexDB updated") },
                error: (err) => { console.log(err) },
                complete: () => { }
              })
          }
        })
      })
  }

}
