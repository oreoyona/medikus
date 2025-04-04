import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value; // Handle both string and Date inputs
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + ' ' + date.toLocaleTimeString('fr-FR', {
        hour: 'numeric',
        minute: 'numeric'
      });
    }
    return '';
  }
}