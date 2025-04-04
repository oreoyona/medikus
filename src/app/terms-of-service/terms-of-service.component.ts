import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent {
  currentYear: number = new Date().getFullYear();
  contactEmail: string = 'contact@medikus-impulse.com';
}