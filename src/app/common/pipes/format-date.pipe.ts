import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  /**
   * Formats a Date or string value into a localized date and time string.
   *
   * @param value The Date object or string to format.
   * @param withTime Optional. A boolean indicating whether to include the time. Defaults to true.
   * @returns The formatted date and time string, or an empty string if the value is null or undefined.
   */
  transform(value: Date | string, withTime: boolean = true): string {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value; // Handle both string and Date inputs

      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric'
      };

      let formattedDate = date.toLocaleDateString('fr-FR', dateOptions);

      if (withTime) {
        formattedDate += ' ' + date.toLocaleTimeString('fr-FR', timeOptions);
      }

      return formattedDate;
    }
    return '';
  }
}