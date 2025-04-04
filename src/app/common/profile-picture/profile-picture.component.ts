import { NgStyle } from '@angular/common';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss',
  imports: [NgStyle, MatRippleModule, RouterLink, MatMenuModule],
  standalone: true,
  
})
export class ProfilePictureComponent {
  @Input() imageUrl: string | null = null;
  @Input() name: string = '';
  matRadiusNumber: number = 20;


  get initials(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : '';
  }

  get backgroundColor(): string {
    const colors: { [key: string]: string } = {
      A: '#007bff', // Blue
      B: '#dc3545', // Red
      C: '#28a745', // Green
      D: '#ffc107', // Yellow
      E: '#17a2b8', // Cyan
      F: '#6f42c1', // Purple
      G: '#fd7e14', // Orange
      H: '#20c997', // Teal
      I: '#6610f2', // Indigo
      J: '#e83e8c', // Pink
      K: '#fd7e14', // Light Orange
      L: '#20c997', // Light Teal
      M: '#6f42c1', // Light Purple
      N: '#007bff', // Light Blue
      O: '#dc3545', // Light Red
      P: '#28a745', // Light Green
      Q: '#ffc107', // Light Yellow
      R: '#17a2b8', // Light Cyan
      S: '#6610f2', // Light Indigo
      T: '#e83e8c', // Light Pink
      U: '#fd7e14', // Light Orange
      V: '#20c997', // Light Teal
      W: '#6f42c1', // Light Purple
      X: '#007bff', // Light Blue
      Y: '#dc3545', // Light Red
      Z: '#28a745', // Light Green
    };

    return colors[this.initials] || '#6c757d'; // Default gray if letter not specified
}

}
